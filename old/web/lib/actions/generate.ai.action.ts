"use server"

import { createId } from "@paralleldrive/cuid2";
import { prisma } from "@/lib/db/prisma"
import { createClient } from "@/lib/supabase/server"
import { serverEnv } from "../env/env.server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation";
import { env } from "../env/env";
import type { Database } from "../supabase/database.types";
import { checkCredits } from "@/lib/credits"
import { getDefaultFeatures } from "@/lib/features/generation-features";
import { validateCreditCost } from "@/lib/actions/calculate-credit-cost";
import { StoryLanguage } from "@/prisma/generated";

type ReturnType = {
  data: any;
  error: string | null;
}

export const generateStory = async(
  text: string, genres?: string[], 
  isForChildren?: boolean, itemsEnabled?: boolean, language: StoryLanguage = "auto",
  clientCost?: number
): Promise<ReturnType> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const user_data = await prisma.user.findUnique({ where: { id: user.id } });
  if (!user_data) throw new Error("User not found");

  const { credits } = await checkCredits(user.id);

  const activeFeatures = getDefaultFeatures(isForChildren || false, itemsEnabled || false);
  const actualCost = await validateCreditCost(clientCost || 0, { activeFeatures, promptLength: text.length });

  if (credits < actualCost) {
    return {
      data: null,
      error: `Not enough credits. This operation requires ${actualCost} credits, but you only have ${credits}.`
    };
  }

  if (!text || text.length < 10) return { data: null, error: "Please provide a valid text with at least 10 characters." };
  if (text.length > 2500) return { data: null, error: "Text is too long. Please provide a shorter text." };

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

  if (!job) {
    return {
      data: null,
      error: "Proccess failed, we couldn't create the job. Try again or contact support."
    };
  }

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

    return {
      data: null,
      error: `Error: ${error.message}`
    };
  }

  if (!data) {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: "No data returned from the function.",
        stage: "FINALIZING"
      }
    });

    return {
      data: null,
      error: "No data returned from the story generation process."
    };
  }
  
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
  
  redirect(new URL(`/story/${jobId}`, env.NEXT_PUBLIC_BASE_URL).toString());
}