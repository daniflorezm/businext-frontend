import { createClient } from "@/utils/supabase/server";

export async function checkSubscription(userId: string) {
  try {
    const supabase = await createClient();

    // Primero, verificamos si existe alguna suscripción para el usuario
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1);

    if (error) {
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("Error checking subscription:", error);
      return false;
    }

    return Boolean(subscriptions && subscriptions.length > 0);
  } catch (error) {
    console.error("Error in checkSubscription:", error);
    return false;
  }
}
