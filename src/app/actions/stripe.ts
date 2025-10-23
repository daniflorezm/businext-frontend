"use server";

import { headers } from "next/headers";

import { stripe } from "@/lib/stripe/types";
import { createClient } from "@/utils/supabase/server";

export async function fetchClientSecret() {
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  // Obtener el usuario actual
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  // Create Checkout Sessions from body params.
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    client_reference_id: user.id, // Añadimos el ID del usuario de Supabase
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of
        // the product you want to sell
        price: "price_1SKQ7q5n0tNNQuF0cnC2XktK",
        quantity: 1,
      },
    ],
    mode: "subscription",
    return_url: `${origin}/paymentredirection?session_id={CHECKOUT_SESSION_ID}`,
    automatic_tax: { enabled: true },
  });

  return session.client_secret;
}
