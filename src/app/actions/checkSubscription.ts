import { createClient } from "@/utils/supabase/server";

export async function checkSubscription(userId: string) {
  try {
    const supabase = await createClient();

    // Primero, verificamos si existe alguna suscripción para el usuario
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("Error checking subscription:", error);
      return false;
    }

    return subscription.status === "active";
  } catch (error) {
    console.error("Error in checkSubscription:", error);
    return false;
  }
}
