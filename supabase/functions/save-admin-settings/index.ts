// Writes to admin_settings (e.g. the global Gemini API key). This table has
// RLS enabled with NO client policies, so it is unreachable except through
// this function (service role) after confirming the caller is an admin.
// The client never re-reads the stored value — the form only ever writes.
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
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return new Response(JSON.stringify({ error: "not_authorized" }), { status: 403 });
  }

  const { key, value } = await req.json();
  if (!key || typeof value !== "string") {
    return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400 });
  }

  await admin.from("admin_settings").upsert({ key, value_encrypted: value });

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
