import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  // 1) Verify caller is an admin via their JWT
  const authHeader = req.headers.get('Authorization') || ''
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userErr } = await userClient.auth.getUser()
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const { data: roleRow } = await userClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .eq('role', 'admin')
    .maybeSingle()
  if (!roleRow) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 2) Parse input
  let body: { booking_id?: string; from_course_date_id?: string; to_course_date_id?: string; reason?: string }
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const { booking_id, from_course_date_id, to_course_date_id, reason } = body
  if (!booking_id || !from_course_date_id || !to_course_date_id) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  if (from_course_date_id === to_course_date_id) {
    return new Response(JSON.stringify({ error: 'Quell- und Zielkurs sind identisch' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // 3) Service-role for the actual mutation + RPC + email
  const admin = createClient(supabaseUrl, serviceKey)

  const [fromCourseRes, toCourseRes, bookingRes] = await Promise.all([
    admin.from('course_dates').select('*').eq('id', from_course_date_id).maybeSingle(),
    admin.from('course_dates').select('*').eq('id', to_course_date_id).maybeSingle(),
    admin.from('bookings').select('id, first_name, last_name, email').eq('id', booking_id).maybeSingle(),
  ])

  if (fromCourseRes.error || !fromCourseRes.data) return jsonErr(corsHeaders, 'Quellkurs nicht gefunden', 404)
  if (toCourseRes.error || !toCourseRes.data) return jsonErr(corsHeaders, 'Zielkurs nicht gefunden', 404)
  if (bookingRes.error || !bookingRes.data) return jsonErr(corsHeaders, 'Buchung nicht gefunden', 404)

  const fromCourse = fromCourseRes.data
  const toCourse = toCourseRes.data
  const booking = bookingRes.data

  if (fromCourse.part !== toCourse.part) {
    return jsonErr(corsHeaders, `Verschieben nur zwischen Kursen vom gleichen Teil (Quelle: Teil ${fromCourse.part}, Ziel: Teil ${toCourse.part}).`, 400)
  }
  if ((toCourse.spots_available ?? 0) < 1) {
    return jsonErr(corsHeaders, 'Im Zielkurs sind keine Plätze mehr verfügbar.', 400)
  }

  // 4) Decrement target first (fails if no spots), then move booking_item, then increment source
  const dec = await admin.rpc('decrement_spots', { course_id: to_course_date_id })
  if (dec.error) return jsonErr(corsHeaders, 'Kein Platz im Zielkurs: ' + dec.error.message, 400)

  const upd = await admin
    .from('booking_items')
    .update({ course_date_id: to_course_date_id })
    .eq('booking_id', booking_id)
    .eq('course_date_id', from_course_date_id)
    .select('id')
  if (upd.error || !upd.data || upd.data.length === 0) {
    // rollback decrement
    await admin.rpc('increment_spots', { course_id: to_course_date_id })
    return jsonErr(corsHeaders, 'Buchungs-Eintrag konnte nicht aktualisiert werden', 400)
  }

  await admin.rpc('increment_spots', { course_id: from_course_date_id })

  // Move signature row (if exists) to new course; ignore conflicts
  await admin
    .from('course_signatures')
    .delete()
    .eq('course_date_id', to_course_date_id)
    .eq('booking_id', booking_id)
  await admin
    .from('course_signatures')
    .update({ course_date_id: to_course_date_id })
    .eq('course_date_id', from_course_date_id)
    .eq('booking_id', booking_id)

  // 5) Send email to participant
  if (booking.email) {
    try {
      await admin.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'course-moved',
          recipientEmail: booking.email,
          idempotencyKey: `course-moved-${booking_id}-${to_course_date_id}-${Date.now()}`,
          templateData: {
            firstName: booking.first_name,
            coursePart: toCourse.part,
            oldDay: fromCourse.day, oldDate: fromCourse.date, oldTime: fromCourse.time, oldLocation: fromCourse.location,
            newDay: toCourse.day, newDate: toCourse.date, newTime: toCourse.time, newLocation: toCourse.location,
            newInstructor: toCourse.instructor,
            reason: reason || null,
          },
        },
      })
    } catch (e) {
      console.error('Email send failed (non-fatal):', e)
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

function jsonErr(headers: Record<string, string>, error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status, headers: { ...headers, 'Content-Type': 'application/json' },
  })
}
