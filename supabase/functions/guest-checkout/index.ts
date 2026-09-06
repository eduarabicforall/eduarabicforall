// Lets a first-time buyer place an order without an existing account.
//
// - If no profile exists for the given email, a new auth user is created
//   (service role) with the password the buyer set at checkout — the
//   account is usable immediately.
// - If a profile already exists for that email, the order is attached to
//   that existing account instead, and the password field is ignored — a
//   guest form must never be able to set/overwrite the password on an
//   account it doesn't already own.
// - An optional discountCode is re-validated server-side (never trust a
//   client-computed discount amount) against `discount_codes`.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { fullName, email, phone, address, productId, quantity, paymentMethod, password, discountCode } =
      await req.json();

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !productId ||
      !paymentMethod
    ) {
      return new Response(JSON.stringify({ error: "missing_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    const qty = Math.max(1, parseInt(quantity) || 1);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    let userId: string;
    let accountCreated = false;

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: cleanEmail,
        password: password.trim(),
        email_confirm: true,
        user_metadata: { full_name: fullName.trim() },
      });
      if (createErr) throw createErr;
      userId = created.user.id;
      accountCreated = true;
    }

    const { data: product, error: productErr } = await admin
      .from("products")
      .select("id, price")
      .eq("id", productId)
      .single();
    if (productErr || !product) {
      return new Response(JSON.stringify({ error: "product_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let discountAmount = 0;
    let appliedCode: string | null = null;
    if (discountCode?.trim()) {
      const { data: dc } = await admin
        .from("discount_codes")
        .select("code, percent_off")
        .eq("is_active", true)
        .ilike("code", discountCode.trim())
        .maybeSingle();
      if (dc) {
        appliedCode = dc.code;
        discountAmount = parseFloat(((parseFloat(product.price) * dc.percent_off) / 100).toFixed(2));
      }
    }

    const SHIPPING = 6;
    const total = (parseFloat(product.price) * qty - discountAmount + SHIPPING).toFixed(2);

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        total,
        payment_provider: paymentMethod,
        payment_status: "pending",
        shipping_status: "pending",
        shipping_address: { name: fullName.trim(), phone: phone.trim(), line: address.trim() },
        discount_code: appliedCode,
        discount_amount: discountAmount,
      })
      .select("id")
      .single();
    if (orderErr) throw orderErr;

    const { error: itemErr } = await admin
      .from("order_items")
      .insert({ order_id: order.id, product_id: product.id, quantity: qty, price: product.price });
    if (itemErr) throw itemErr;

    return new Response(JSON.stringify({ orderId: order.id, accountCreated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
