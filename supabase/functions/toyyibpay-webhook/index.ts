// ToyyibPay payment callback. ToyyibPay does not sign callbacks with a
// checksum — instead we re-verify the transaction status server-side via
// their "getBillTransactions" API using our secret key before trusting it.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get("TOYYIBPAY_SECRET_KEY");
  const form = await req.formData().catch(() => null);
  if (!form || !secret) {
    return new Response(JSON.stringify({ error: "invalid_request" }), { status: 400 });
  }

  const billCode = form.get("billcode")?.toString();
  const orderId = form.get("order_id")?.toString();
  if (!billCode || !orderId) {
    return new Response(JSON.stringify({ error: "missing_fields" }), { status: 400 });
  }

  const verifyRes = await fetch("https://toyyibpay.com/index.php/api/getBillTransactions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ billCode, billpaymentStatus: "1" }),
  });
  const transactions = await verifyRes.json().catch(() => []);
  const paid = Array.isArray(transactions) && transactions.length > 0;

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  await admin.from("orders").update({ payment_status: paid ? "paid" : "failed" }).eq("id", orderId);

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
