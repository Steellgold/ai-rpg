import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { generateObject } from "npm:ai";
import { createClient } from "npm:@supabase/supabase-js";
import { detectLanguageWithAI } from "../shared/ai-services.ts";
import { getStoryGenerationPrompt, getLanguageInstructions } from "../shared/prompts.ts";
import { storyGenerationSchema } from "../shared/schemas.ts";
import { logger, updateJob } from "../shared/utils.ts";
import { createStoryFromData } from "../shared/data-services.ts";
import { registry } from "../shared/registry.ts";

interface RequestParams {
  text: string;
  genres: string[];
  userId: string;
  jobId: string;
  isPremium: boolean;
  isChildren: boolean;
  items: boolean;
  language?: string;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }

  const { text, genres, userId, jobId, isPremium = false, isChildren = false, items = false, language = "auto" } = await req.json() as RequestParams;

  if (!text || !userId || !jobId) {
    return new Response(JSON.stringify({
      error: "Missing required fields: text, userId, and jobId"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 400
    });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SERVICE_ROLE_KEY")!);

  try {
    if (!text.trim() || text.length < 10) {
      throw new Error("Text is too short or empty");
    }

    const { data: existingJob, error: jobError } = await supabase.from('Job').select('*').eq('id', jobId).single();
    if (jobError || !existingJob) {
      throw new Error(`Job not found: ${jobError?.message || "Invalid ID"}`);
    }

    if (existingJob.userId !== userId) {
      throw new Error("You are not authorized to access this job");
    }

    let outputLanguage = language;
    
    if (language === "auto") {
      await updateJob(supabase, jobId, {
        status: 'RUNNING',
        progress: 5,
        stage: 'DETECTING_LANGUAGE',
        startedAt: new Date().toISOString()
      });
      
      outputLanguage = await detectLanguageWithAI(text, jobId);
      logger.info(jobId, `AI-detected language: ${outputLanguage}`);
    }
    
    await updateJob(supabase, jobId, {
      status: 'RUNNING',
      progress: 10,
      stage: 'GENERATING_STORY',
      ...(language === "auto" ? {} : { startedAt: new Date().toISOString() })
    });

    const model = registry.languageModel("openai:gpt-4o-mini");
    logger.info(jobId, `Generating story content...`);

    const languageInstructions = getLanguageInstructions(outputLanguage as string);
    const prompt = getStoryGenerationPrompt(text, genres, isChildren, items, languageInstructions);

    const { object: storyObject } = await generateObject({ model, schema: storyGenerationSchema, prompt });

    await updateJob(supabase, jobId, {
      progress: 30,
      output: {
        story: storyObject
      },
      stage: 'CREATING_STORY'
    });

    const storyResult = await createStoryFromData(
      supabase,
      { ...storyObject, genres },
      userId,
      jobId,
      isPremium,
      items,
      outputLanguage as string
    );

    await updateJob(supabase, jobId, {
      status: 'COMPLETED',
      progress: 100,
      stage: null,
      completedAt: new Date().toISOString(),
      output: {
        story: storyObject,
        storyId: storyResult.storyId,
        firstSceneId: storyResult.firstSceneId,
        gameSaveId: storyResult.gameSaveId,
        language: storyResult.language
      }
    });

    logger.info(jobId, `Job completed successfully!`);

    return new Response(JSON.stringify(
      { message: "Story generation job started", jobId: jobId }),
      { headers: { "Content-Type": "application/json" }, status: 202 }
    );
  } catch (error) {
    logger.error(jobId, "Error starting job:", error);

    try {
      await updateJob(supabase, jobId, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date().toISOString()
      });
    } catch (updateError) {
      console.error("Error updating job status to failed:", updateError);
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});