// AI Ustaz proxy — calls Google Gemini server-side so the API key never
// reaches the client. Enforces per-module daily_quota via ai_usage_log.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401 });
  }

  const { module_id, message } = await req.json();
  if (!module_id || !message) {
    return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400 });
  }

  const { data: config } = await admin.from("module_ai_config").select("*").eq("module_id", module_id).single();
  if (!config) {
    return new Response(JSON.stringify({ error: "module_not_configured" }), { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await admin
    .from("ai_usage_log")
    .select("*")
    .eq("user_id", user.id)
    .eq("module_id", module_id)
    .eq("date", today)
    .maybeSingle();

  if ((usage?.message_count ?? 0) >= config.daily_quota) {
    return new Response(JSON.stringify({ error: "quota_exceeded" }), { status: 429 });
  }

  const { data: settings } = await admin.from("admin_settings").select("value_encrypted").eq("key", "gemini_api_key").maybeSingle();
  const apiKey = settings?.value_encrypted;

  let reply = "AI Ustaz is not configured yet — an admin needs to set the Gemini API key.";
  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: config.system_prompt }] },
            contents: [{ role: "user", parts: [{ text: message }] }],
          }),
        },
      );
      const json = await res.json();
      reply = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a reply.";
    } catch {
      reply = "AI Ustaz is temporarily unavailable.";
    }
  }

  await admin.from("ai_usage_log").upsert({
    user_id: user.id,
    module_id,
    date: today,
    message_count: (usage?.message_count ?? 0) + 1,
  }, { onConflict: "user_id,module_id,date" });

  return new Response(JSON.stringify({ reply }), { headers: { "Content-Type": "application/json" } });
});
