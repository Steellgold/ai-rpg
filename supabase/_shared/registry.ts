import { createProviderRegistry } from "npm:ai";
import { createOpenAI } from "npm:@ai-sdk/openai";

export const registry = createProviderRegistry({
  openai: createOpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY")
  })
});