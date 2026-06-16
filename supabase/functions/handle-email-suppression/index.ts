import { createClient } from 'npm:@supabase/supabase-js@2'

// Resend webhook handler (Svix-style HMAC verification).
// Replaces previous @lovable.dev/webhooks-js implementation.
// Configure in Resend dashboard: Webhooks -> Add endpoint -> select bounce/complaint events.
// Set RESEND_WEBHOOK_SECRET (starts with "whsec_") in project secrets.

interface ResendWebhookPayload {
  type: string
  created_at: string
  data: {
    email_id?: string
    to?: string[] | string
    from?: string
    subject?: string
    bounce?: { type?: string; message?: string }
    [k: string]: unknown
  }
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function base64Decode(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

// Verify Svix-style signature used by Resend webhooks.
// Signed string: `${svix_id}.${svix_timestamp}.${body}`
// Header `svix-signature` contains space-separated `v1,<base64>` entries.
async function verifyResendSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  signatureHeader: string,
  body: string,
): Promise<boolean> {
  // Secret format: "whsec_<base64>"
  const rawSecret = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret
  const keyBytes = base64Decode(rawSecret)

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const toSign = `${svixId}.${svixTimestamp}.${body}`
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(toSign)))

  // Reject stale timestamps (>5 min skew)
  const tsSecs = parseInt(svixTimestamp, 10)
  if (!Number.isFinite(tsSecs) || Math.abs(Date.now() / 1000 - tsSecs) > 300) {
    return false
  }

  for (const part of signatureHeader.split(' ')) {
    const [version, b64] = part.split(',')
    if (version !== 'v1' || !b64) continue
    try {
      const expected = base64Decode(b64)
      if (timingSafeEqual(sig, expected)) return true
    } catch {
      // Ignore malformed entry, try next
    }
  }
  return false
}

function extractRecipient(data: ResendWebhookPayload['data']): string | null {
  if (Array.isArray(data.to) && data.to.length > 0) return String(data.to[0])
  if (typeof data.to === 'string') return data.to
  return null
}

function mapEventTypeToReason(type: string): 'bounce' | 'complaint' | null {
  // Resend event types: email.bounced, email.complained, email.delivered, email.sent, ...
  if (type === 'email.bounced') return 'bounce'
  if (type === 'email.complained') return 'complaint'
  return null
}

function mapReasonToStatus(reason: string): 'bounced' | 'complained' | 'suppressed' {
  switch (reason) {
    case 'bounce':
      return 'bounced'
    case 'complaint':
      return 'complained'
    default:
      return 'suppressed'
  }
}

function mapReasonToMessage(reason: string): string {
  switch (reason) {
    case 'bounce':
      return 'Permanent bounce — email address is invalid or rejected'
    case 'complaint':
      return 'Spam complaint — recipient marked email as spam'
    default:
      return 'Email suppressed'
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return jsonResponse({ error: 'Server configuration error' }, 500)
  }

  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')
  if (!svixId || !svixTimestamp || !svixSignature) {
    return jsonResponse({ error: 'Missing signature headers' }, 401)
  }

  const body = await req.text()

  const ok = await verifyResendSignature(webhookSecret, svixId, svixTimestamp, svixSignature, body)
  if (!ok) {
    console.error('Invalid Resend webhook signature')
    return jsonResponse({ error: 'Invalid signature' }, 401)
  }

  let payload: ResendWebhookPayload
  try {
    payload = JSON.parse(body)
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  const reason = mapEventTypeToReason(payload.type)
  if (!reason) {
    // Not a suppression event — ack and ignore (e.g. email.sent, email.delivered)
    return jsonResponse({ ignored: true, type: payload.type })
  }

  const recipient = extractRecipient(payload.data)
  if (!recipient) {
    return jsonResponse({ error: 'Missing recipient' }, 400)
  }

  const normalizedEmail = recipient.toLowerCase()
  const metadata: Record<string, unknown> = {
    type: payload.type,
    email_id: payload.data.email_id ?? null,
    bounce: payload.data.bounce ?? null,
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { error: suppressError } = await supabase
    .from('suppressed_emails')
    .upsert(
      { email: normalizedEmail, reason, metadata },
      { onConflict: 'email' },
    )

  if (suppressError) {
    console.error('Failed to upsert suppressed email', {
      error: suppressError,
      email_redacted: normalizedEmail[0] + '***@' + normalizedEmail.split('@')[1],
    })
    return jsonResponse({ error: 'Failed to write suppression' }, 500)
  }

  const { error: insertError } = await supabase.from('email_send_log').insert({
    message_id: payload.data.email_id ?? null,
    template_name: 'system',
    recipient_email: normalizedEmail,
    status: mapReasonToStatus(reason),
    error_message: mapReasonToMessage(reason),
    metadata,
  })

  if (insertError) {
    console.warn('Failed to insert email_send_log', { error: insertError })
  }

  console.log('Resend suppression processed', {
    email_redacted: normalizedEmail[0] + '***@' + normalizedEmail.split('@')[1],
    reason,
    type: payload.type,
  })

  return jsonResponse({ success: true })
})
