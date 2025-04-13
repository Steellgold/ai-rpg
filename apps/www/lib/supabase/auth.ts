import { cache } from "react"
import { createClient } from "./server";

export type UserSession = {
  user: {
    id: string;
    email: string;
    display_name: string;
    image_url: string | null;
    credits: number;
  } | null;
  subscription?: {
    id: string;
    status: string;
    plan: string;
    current_period_end: Date;
  } | null;
};

export const auth = cache(async (): Promise<UserSession | null> => {
  const supabase = await createClient();

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return null;
    }

    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("id, email, display_name, image_url, credits")
      .eq("id", session.user.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return null;
    }

    return {
      user: {
        id: userData.id,
        email: userData.email,
        display_name: userData.display_name,
        image_url: userData.image_url,
        credits: userData.credits,
      }
    };
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
});

export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  
  return session;
}