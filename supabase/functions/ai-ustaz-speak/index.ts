// Arabic text-to-speech for My Vocab — Gemini's speech model reads the text
// (with its harakat) aloud, so the sound is far closer to a native reader than
// the browser's built-in voices. The Gemini key stays server-side.
//
// Only signed-in learners may call it, and only for text they have saved to
// their own My Vocab, so it can't be used as a free general-purpose TTS.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { decodeBase64, encodeBase64 } from "jsr:@std/encoding@1/base64";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_TEXT_LENGTH = 400;
const API = "https://generativelanguage.googleapis.com/v1beta";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Gemini returns raw 16-bit PCM; browsers need a WAV container to play it.
function pcmToWav(pcm: Uint8Array, sampleRate: number) {
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const write = (offset: number, s: string) => [...s].forEach((c, i) => v.setUint8(offset + i, c.charCodeAt(0)));
  write(0, "RIFF");
  v.setUint32(4, 36 + pcm.length, true);
  write(8, "WAVE");
  write(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  write(36, "data");
  v.setUint32(40, pcm.length, true);
  const wav = new Uint8Array(44 + pcm.length);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcm, 44);
  return wav;
}

// The speech models are renamed often, so ask the API which ones this key can use.
let cachedModels: string[] | undefined;
async function speechModels(apiKey: string) {
  if (cachedModels) return cachedModels;
  const res = await fetch(`${API}/models?pageSize=200&key=${apiKey}`);
  const data = await res.json().catch(() => null);
  const names: string[] = (data?.models ?? [])
    .filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
      /tts/i.test(m.name) && m.supportedGenerationMethods?.includes("generateContent")
    )
    .map((m: { name: string }) => m.name);
  // Prefer flash (cheaper / faster) over pro, and newer versions first.
  names.sort((a, b) => Number(/flash/i.test(b)) - Number(/flash/i.test(a)) || b.localeCompare(a));
  if (names.length) cachedModels = names;
  return names;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
  );
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "not_authenticated" }, 401);

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return json({ error: "missing_fields" }, 400);
  if (text.length > MAX_TEXT_LENGTH) return json({ error: "text_too_long" }, 400);

  const { data: saved } = await admin
    .from("user_vocab")
    .select("id, transliteration")
    .eq("user_id", user.id)
    .eq("arabic", text)
    .limit(1)
    .maybeSingle();
  if (!saved) return json({ error: "not_saved" }, 403);

  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";

  const { data: settings } = await admin
    .from("admin_settings")
    .select("value_encrypted")
    .eq("key", "gemini_api_key")
    .maybeSingle();
  const apiKey = settings?.value_encrypted;
  if (!apiKey) return json({ error: "not_configured" }, 503);

  const models = await speechModels(apiKey);
  if (!models.length) {
    return json({ error: "no_speech_model", ...(isAdmin ? { detail: "No TTS model available to this key" } : {}) }, 502);
  }

  // The saved transliteration is the reference for how it must sound, so the audio
  // matches what the learner reads on screen (tanwin, case endings and all).
  const transliteration = String(saved.transliteration ?? "").trim();
  const prompt = [
    `Read the following Arabic aloud in clear Modern Standard Arabic at a calm, slightly slow pace for a learner.`,
    `Pronounce every vowel mark (harakat) exactly as written.`,
    transliteration
      ? `Its exact pronunciation is given by this transliteration — the audio must sound exactly like it, including every short vowel, tanwin and word ending: ${transliteration}`
      : ``,
    `Say only the Arabic text, nothing else:`,
    text,
  ].filter(Boolean).join("\n");

  let lastError = "";
  for (const model of models.slice(0, 2)) {
    try {
      const res = await fetch(`${API}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
          },
        }),
      });
      const data = await res.json().catch(() => null);
      const part = data?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: unknown }) => p.inlineData);
      if (part?.inlineData?.data) {
        const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? "")?.[1]) || 24000;
        const wav = pcmToWav(decodeBase64(part.inlineData.data), rate);
        return json({ audio: encodeBase64(wav), mime: "audio/wav" });
      }
      lastError = `[${model}] ${String(data?.error?.message ?? "no audio returned").split(String(apiKey)).join("[key]").slice(0, 200)}`;
      console.error("ai-ustaz-speak failure", res.status, lastError);
    } catch (err) {
      lastError = `[${model}] unreachable`;
      console.error("ai-ustaz-speak unreachable", String(err));
    }
  }
  return json({ error: "no_audio", ...(isAdmin ? { detail: lastError } : {}) }, 502);
});
