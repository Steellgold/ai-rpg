import { createProviderRegistry } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const registry = createProviderRegistry({
  openai: createOpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")
  })
});