import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/types";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    const supabase = await createClient();

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionDetails = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          if (!subscriptionDetails) {
            console.error("No se pudieron obtener detalles de la suscripción");
            break;
          }

          // First, deactivate any existing active subscriptions for this user
          await supabase
            .from("subscriptions")
            .update({ status: "canceled", updated_at: new Date() })
            .eq("user_id", session.client_reference_id)
            .eq("status", "active")
            .neq("stripe_subscription_id", subscriptionDetails.id);

          // Then create/update the new subscription
          await supabase.from("subscriptions").upsert(
            {
              user_id: session.client_reference_id,
              stripe_subscription_id: subscriptionDetails.id,
              status: subscriptionDetails.status,
              updated_at: new Date(),
            },
            {
              onConflict: "stripe_subscription_id",
              ignoreDuplicates: false,
            }
          );

          console.log(`Suscripción creada: ${subscriptionDetails.id}`);
        }
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;

        // Verificar si ya existe la suscripción
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id, user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        // Si no existe, probablemente llegó antes que el checkout.session.completed
        if (!existingSub) {
          console.log(
            `Suscripción ${subscription.id} no encontrada, esperando checkout.session.completed`
          );
          break;
        }

        const { data: subscriptionUpdated, error } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            updated_at: new Date(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
          break;
        }

        if (subscriptionUpdated) {
          console.log(`Suscripcion ${subscription.id} ha sido actualizada`);
        } else {
          console.log(
            `No se encontró la suscripción ${subscription.id} para actualizar`
          );
        }

        console.log("Status actualizado a ", subscription.status);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;

        const { error: deleteError } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date(),
          })
          .eq("stripe_subscription_id", deletedSubscription.id);

        if (deleteError) {
          console.error("Error canceling subscription:", deleteError);
          break;
        }

        console.log(`Suscripción cancelada: ${deletedSubscription.id}`);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in webhook:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
