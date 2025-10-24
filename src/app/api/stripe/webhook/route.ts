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

          const { data, error } = await supabase.rpc(
            "handle_new_subscription",
            {
              p_user_id: session.client_reference_id,
              p_stripe_subscription_id: subscriptionDetails.id,
              p_status: subscriptionDetails.status,
            }
          );

          if (error) {
            console.error("Error handling subscription:", error);
            // Importante: devolver error para que Stripe reintente
            return NextResponse.json(
              { error: "Failed to process subscription" },
              { status: 500 }
            );
          }

          console.log(`Suscripción procesada: ${subscriptionDetails.id}`);
        }
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;

        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id, user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (!existingSub) {
          console.log(
            `Suscripción ${subscription.id} no encontrada, esperando checkout.session.completed`
          );
          break;
        }

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            updated_at: new Date(),
          })
          .eq("stripe_subscription_id", subscription.id);

        console.log(`Suscripción actualizada: ${subscription.id}`);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date(),
          })
          .eq("stripe_subscription_id", deletedSubscription.id);

        console.log(`Suscripción cancelada: ${deletedSubscription.id}`);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error in webhook:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
