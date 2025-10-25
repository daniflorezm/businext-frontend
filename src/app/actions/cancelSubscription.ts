"use server";

import { stripe } from "@/lib/stripe/types";
import { createClient } from "@/utils/supabase/server";

export async function cancelUserSubscription() {
  const supabase = await createClient();
  // Obtener usuario actual
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated");
  }

  // Buscar la suscripción activa del usuario en la base de datos
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (subError || !subscription) {
    throw new Error("No active subscription found");
  }

  // Cancelar la suscripción en Stripe al final del periodo
  const updatedSubscription = await stripe.subscriptions.update(
    subscription.stripe_subscription_id,
    {
      cancel_at_period_end: true,
    }
  );

  // Convertir a objeto plano para evitar errores de serialización
  return JSON.parse(JSON.stringify(updatedSubscription));
}
