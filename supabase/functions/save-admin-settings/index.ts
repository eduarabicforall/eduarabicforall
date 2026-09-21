// Writes to admin_settings (e.g. the global Gemini API key). This table has
// RLS enabled with NO client policies, so it is unreachable except through
// this function (service role) after confirming the caller is an admin.
// The client never re-reads the stored value — the form only ever writes.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Only these settings can be written through this endpoint.
const ALLOWED_KEYS = ["gemini_api_key"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

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
  if (!user) return json({ error: "not_authenticated" }, 401);

  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return json({ error: "not_authorized" }, 403);

  const body = await req.json().catch(() => null);
  const key = body?.key;
  const value = typeof body?.value === "string" ? body.value.trim() : "";
  if (!ALLOWED_KEYS.includes(key) || !value) return json({ error: "missing_fields" }, 400);

  const { error } = await admin.from("admin_settings").upsert({ key, value_encrypted: value });
  if (error) return json({ error: "save_failed" }, 500);

  return json({ ok: true });
});
