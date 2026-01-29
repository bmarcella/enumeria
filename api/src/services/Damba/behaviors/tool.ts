/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from "@App/damba.import";
import { DambaApi, DEventHandlerFactory } from "@Damba/v2/service/DambaService";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { z } from "zod";

const SearchArgsSchema = z.object({
  query: z.string().min(1),
});

export const searchTool = {
  name: "web_search",
  description: "Search the web for information",
  invoke: async (raw: unknown) => {
    const { query } = SearchArgsSchema.parse(raw);

    // Simule une recherche (API, DB, etc.)
    return [
      { title: "Java Developer Jobs", url: "https://example.com/1" },
      { title: "Senior Java Engineer", url: "https://example.com/2" },
    ];
  },
};


// ---- Input validation
const InputSchema = z.object({
  query: z.string().min(1),
});

export const pipelineWithToolBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    // 1️⃣ Read input
    const getInput = new RunnableLambda({
      func: () => api?.params() ?? {},
    });

    // 2️⃣ Validate input
    const validateInput = new RunnableLambda({
      func: (raw) => InputSchema.parse(raw),
    });

    // 3️⃣ Call Tool.invoke (IMPORTANT PART)
    const callSearchTool = new RunnableLambda({
      func: async (input: { query: string }) => {
        const results = await searchTool.invoke({ query: input.query });
        return {
          query: input.query,
          results,
        };
      },
    });

    // 4️⃣ Prepare prompt variables
    const toPromptVars = new RunnableLambda({
      func: (data: { query: string; results: any[] }) => ({
        question: data.query,
        context: JSON.stringify(data.results, null, 2),
      }),
    });

    // 5️⃣ Prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant."],
      [
        "user",
        `
Question: {question}

Search results:
{context}

Give a concise answer based ONLY on the results.
        `.trim(),
      ],
    ]);

    // 6️⃣ Post-process LLM output
    const toApiResponse = new RunnableLambda({
      func: (msg: any) => ({
        content: msg.content,
      }),
    });

    // ---- Compose pipeline
    const chain = getInput
      .pipe(validateInput)
      .pipe(callSearchTool)   // 👈 TOOL USED HERE
      .pipe(toPromptVars)
      .pipe(prompt)
      .pipe(e.in.openAi)
      .pipe(toApiResponse);

    try {
      const result = await chain.invoke({});
      e.out.send(result);
    } catch (err: any) {
      e.out.status(400).send({
        error: "Pipeline failed",
        detail: err?.message ?? String(err),
      });
    }
  };
};
