import { createClient } from "@/utils/supabase/server";

export async function checkSubscription(userId: string) {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error) {
      console.error("Error checking subscription:", error);
      return false;
    }

    if (!subscription) {
      return false;
    }

    return subscription.status === "active";
  } catch (error) {
    console.error("Error in checkSubscription:", error);
    return false;
  }
}
