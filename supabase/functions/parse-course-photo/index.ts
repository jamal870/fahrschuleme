// Extract course planning data from an uploaded photo using Google Gemini Vision (direct API)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Admin auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!role) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) return new Response(JSON.stringify({ error: "imageBase64 required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const systemPrompt = `Du bist ein Assistent, der aus einem Foto eines handschriftlichen Kursplanungs-Zettels die geplanten Motorrad-Grundkurs-Termine (MGK) extrahiert.
Lies sorgfältig: Datum (TT.MM.JJJJ – wenn nur TT.MM angegeben, nimm das nächste passende Jahr ab heute), Tag (Montag, Dienstag...), Zeit (z.B. "13:00 – 17:00"), Teil (1, 2 oder 3), Ort (Standard "Wettingen"), Fahrlehrer (Kürzel oder Name), Plätze (Standard 5), Preis (Standard 160).
Gib AUSSCHLIESSLICH gültiges JSON zurück, kein Markdown, keine Erklärung:
{ "courses": [ { "date":"TT.MM.JJJJ", "day":"Montag", "time":"13:00 – 17:00", "part":1, "location":"Wettingen", "instructor":"JL", "price":160, "spots_available":5 } ] }`;

    // Direct Google Gemini API (no Lovable dependency)
    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{
          role: "user",
          parts: [
            { text: "Extrahiere alle erkennbaren Kurstermine aus diesem Bild." },
            { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
          ],
        }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: "Gemini API error", details: errText, status: response.status }), {
        status: response.status === 429 ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    // Strip code fences if present
    const cleaned = text.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    let parsed: any = null;
    try { parsed = JSON.parse(cleaned); } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) { try { parsed = JSON.parse(match[0]); } catch {} }
    }
    if (!parsed?.courses) {
      return new Response(JSON.stringify({ error: "Konnte Antwort nicht parsen", raw: text }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
