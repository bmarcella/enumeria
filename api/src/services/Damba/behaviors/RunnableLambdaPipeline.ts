/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from "@App/damba.import";
import { DambaApi, DEventHandlerFactory } from "@Damba/v2/service/DambaService";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda, RunnablePassthrough } from "@langchain/core/runnables";
import { z } from "zod";

/**
 * Example: Full pipeline WITHOUT agents
 * Flow:
 * 1) Read + validate input (query)
 * 2) (Optional) preprocess / normalize
 * 3) Prompt template
 * 4) LLM call
 * 5) Postprocess output into a consistent API response shape
 */

// ---- 1) Input validation (Zod)
const InputSchema = z.object({
  query: z.string().min(1, "Query parameter is required"),
});

type Input = z.infer<typeof InputSchema>;

// ---- 2) Prompt (no agent)
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant."],
  ["user", "Explain {topic} clearly in a {tone} tone."],
]);

export const pipelineNoAgentBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    // Runnable: get raw input from Damba API params
    const getParams = new RunnableLambda({
      func: () => api?.params() ?? {},
    });

    // Runnable: validate input
    const validate = new RunnableLambda({
      func: (raw: any): Input => InputSchema.parse(raw),
    });

    // Runnable: normalize / enrich inputs for the prompt
    const toPromptVars = new RunnableLambda({
      func: (input: Input) => ({
        topic: input.query.trim(),
        tone: "beginner-friendly",
      }),
    });

    // Runnable: postprocess the LLM response into your API shape
    const toApiResponse = new RunnableLambda({
      func: (msg: any) => ({
        content: msg?.content ?? "",
      }),
    });

    // ---- Pipeline composition (no agent)
    const chain = getParams
      .pipe(validate)
      .pipe(toPromptVars)
      .pipe(prompt)
      .pipe(e.in.openAi) // or e.in.ollama
      .pipe(toApiResponse);

    try {
      const result = await chain.invoke({});
      e.out.send(result);
    } catch (err: any) {
      e.out.status(400).send({
        error: "Invalid request",
        detail: err?.message ?? String(err),
      });
    }
  };
};
