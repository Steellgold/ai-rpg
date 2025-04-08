"use server"

import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { serverEnv } from "../env/env.server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation";
import { env } from "../env/env";
import { Database } from "../supabase/database.types";
import { checkCredits } from "@/lib/limit"
import { StoryLanguage } from "@prisma/client";

export const generateStory = async (
  text: string, 
  genres?: string[], 
  isForChildren?: boolean, 
  itemsEnabled?: boolean,
  language: StoryLanguage = "auto"
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  const { credits, isPremium } = await checkCredits(user.id);
  if (!isPremium && credits <= 0) {
    throw new Error("No credits available. Please purchase more credits.");
  }

  const supabase_role_key = createSupabaseClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY
  );

  const jobId = createId();
  const job = await prisma.job.create({
    data: {
      id: jobId,
      userId: user.id,
      stage: "INITIALIZED",
      input: { 
        text, 
        genres: genres || [],
        language
      }
    }
  });

  if (!job) throw new Error("Job not created");

  const { data, error } = await supabase_role_key.functions.invoke("generate-story-v3", {
    body: {
      text,
      genres: genres || [],
      userId: user.id,
      jobId,
      isPremium: user_data.subscription_status == "active",
      isChildren: isForChildren || false,
      items: user_data.subscription_id == "active" ? itemsEnabled : false,
      language
    }
  });

  if (error) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: error.message,
        stage: "FINALIZING"
      }
    });
    throw new Error(error.message);
  }

  if (!data) throw new Error("No data returned from function");
  console.log("Data from function:", data);
  
  redirect(env.NEXT_PUBLIC_BASE_URL + "/story/" + jobId);
}