// Bayarcash payment callback. Verifies the gateway checksum (HMAC-SHA256 of
// the payload with BAYARCASH_SECRET_KEY, per Bayarcash docs) before trusting
// the payload, then updates orders.payment_status.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

async function verifyChecksum(payload: Record<string, string>, secret: string) {
  const { checksum, ...rest } = payload;
  const message = Object.keys(rest).sort().map((k) => `${k}${rest[k]}`).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === checksum;
}

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get("BAYARCASH_SECRET_KEY");
  const body = await req.json().catch(() => null);
  if (!body || !secret) {
    return new Response(JSON.stringify({ error: "invalid_request" }), { status: 400 });
  }

  const valid = await verifyChecksum(body, secret);
  if (!valid) {
    return new Response(JSON.stringify({ error: "invalid_checksum" }), { status: 401 });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const status = body.status === "3" ? "paid" : "failed"; // Bayarcash: 3 = success
  await admin.from("orders").update({ payment_status: status }).eq("id", body.order_number);

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
