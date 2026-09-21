// Admin user management: list accounts, delete an account, set a new password.
//
// Auth accounts can only be changed with the service role, so this runs
// server-side and re-checks on every call that the caller is an admin (never
// trust the client). Safety rules enforced here:
//   - an admin can't delete their own account
//   - admin accounts can't be deleted or have their password set through this
//     endpoint (so one admin can't take over or remove another)
//   - an admin can't change their own role; promoting/demoting others is
//     mirrored into admin_allowlist
// Deleting an account cascades to everything owned by that user (profile,
// orders, activated modules, reviews, saved vocab, chat history).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72; // bcrypt's limit

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

  const { data: caller } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (caller?.role !== "admin") return json({ error: "not_authorized" }, 403);

  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === "list") {
    // Every auth account (paged), joined with profile / module / order counts.
    const accounts: Array<{ id: string; email?: string; created_at: string; last_sign_in_at?: string | null }> = [];
    for (let page = 1; page <= 20; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return json({ error: "list_failed" }, 500);
      accounts.push(...data.users);
      if (data.users.length < 1000) break;
    }

    const [{ data: profiles }, { data: modules }, { data: orders }] = await Promise.all([
      admin.from("profiles").select("id, full_name, role"),
      admin.from("user_modules").select("user_id"),
      admin.from("orders").select("user_id"),
    ]);
    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const count = (rows: Array<{ user_id: string | null }> | null) => {
      const m = new Map<string, number>();
      for (const r of rows ?? []) if (r.user_id) m.set(r.user_id, (m.get(r.user_id) ?? 0) + 1);
      return m;
    };
    const moduleCount = count(modules);
    const orderCount = count(orders);

    const users = accounts
      .map((a) => ({
        id: a.id,
        email: a.email ?? "",
        full_name: profileById.get(a.id)?.full_name ?? "",
        role: profileById.get(a.id)?.role ?? "student",
        created_at: a.created_at,
        last_sign_in_at: a.last_sign_in_at ?? null,
        modules: moduleCount.get(a.id) ?? 0,
        orders: orderCount.get(a.id) ?? 0,
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return json({ users });
  }

  if (action === "set_role") {
    const targetId = body?.user_id;
    const role = body?.role;
    if (typeof targetId !== "string" || !UUID.test(targetId) || (role !== "admin" && role !== "student")) {
      return json({ error: "missing_fields" }, 400);
    }
    if (targetId === user.id) return json({ error: "cannot_target_self" }, 403);

    const { data: target } = await admin.auth.admin.getUserById(targetId);
    const email = target?.user?.email?.toLowerCase();
    if (!email) return json({ error: "user_not_found" }, 404);

    const { error } = await admin.from("profiles").update({ role }).eq("id", targetId);
    if (error) {
      console.error("admin-users set_role failed", error.message);
      return json({ error: "role_failed" }, 500);
    }

    // Keep the signup allowlist in step so the change survives a re-signup.
    const { error: listError } = role === "admin"
      ? await admin.from("admin_allowlist").upsert({ email }, { onConflict: "email" })
      : await admin.from("admin_allowlist").delete().eq("email", email);
    if (listError) console.error("admin-users allowlist sync failed", listError.message);

    return json({ ok: true, role });
  }

  if (action === "delete" || action === "set_password") {
    const targetId = body?.user_id;
    if (typeof targetId !== "string" || !UUID.test(targetId)) return json({ error: "missing_fields" }, 400);

    const { data: target } = await admin.from("profiles").select("role").eq("id", targetId).maybeSingle();
    if (target?.role === "admin") {
      return json({ error: targetId === user.id ? "cannot_target_self" : "cannot_target_admin" }, 403);
    }
    if (targetId === user.id) return json({ error: "cannot_target_self" }, 403);

    if (action === "delete") {
      const { error } = await admin.auth.admin.deleteUser(targetId);
      if (error) {
        console.error("admin-users delete failed", error.message);
        return json({ error: "delete_failed" }, 500);
      }
      return json({ ok: true });
    }

    const password = typeof body?.password === "string" ? body.password : "";
    if (password.length < MIN_PASSWORD) return json({ error: "password_too_short" }, 400);
    if (password.length > MAX_PASSWORD) return json({ error: "password_too_long" }, 400);
    const { error } = await admin.auth.admin.updateUserById(targetId, { password });
    if (error) {
      console.error("admin-users set_password failed", error.message);
      return json({ error: "password_failed", detail: error.message }, 400);
    }
    return json({ ok: true });
  }

  return json({ error: "unknown_action" }, 400);
});
