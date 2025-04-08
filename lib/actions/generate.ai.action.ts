"use server"

import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { serverEnv } from "../env/env.server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation";
import { env } from "../env/env";
import { Database } from "../supabase/database.types";
import { checkCredits } from "@/lib/credits"
import { StoryLanguage } from "@prisma/client";
import { getDefaultFeatures } from "@/lib/features/generation-features";
import { validateCreditCost } from "@/lib/actions/calculate-credit-cost";

export const generateStory = async (
  text: string, 
  genres?: string[], 
  isForChildren?: boolean, 
  itemsEnabled?: boolean,
  language: StoryLanguage = "auto",
  clientCost?: number
) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  const { credits } = await checkCredits(user.id);

  const activeFeatures = getDefaultFeatures(isForChildren || false, itemsEnabled || false);
  const actualCost = await validateCreditCost(clientCost || 0, { activeFeatures, promptLength: text.length });

  if (credits < actualCost) {
    throw new Error(`Not enough credits. This operation requires ${actualCost} credits, but you only have ${credits}.`);
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
        language,
        creditCost: actualCost
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
      isChildren: isForChildren || false,
      items: itemsEnabled || false,
      language,
      creditCost: actualCost
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
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: credits - actualCost
    }
  });
  
  await prisma.creditTransaction.create({
    data: {
      id: createId(),
      userId: user.id,
      amount: -actualCost,
      balanceAfter: credits - actualCost,
      description: "Story generation",
      transactionType: "USAGE",
      jobId: jobId
    }
  });
  
  redirect(env.NEXT_PUBLIC_BASE_URL + "/story/" + jobId);
}