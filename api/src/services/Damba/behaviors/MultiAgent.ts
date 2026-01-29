/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from "@App/damba.import";
import { DambaApi, DEventHandlerFactory } from "@Damba/v2/service/DambaService";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createAgent } from "langchain";

// Router prompt: decide which specialist to use
const routerPrompt = ChatPromptTemplate.fromMessages([
  ["system", `
You are a router. Choose ONE route:
- "codebase" if the question is about Damba/code/project internals.
- "web" if it needs fresh info from the internet.
Return ONLY one word: codebase or web
`.trim()],
  ["user", "{q}"],
]);

export const multiAgentsBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const q = api?.params().query;
    if (!q) {
      e.out.status(400).send({ error: "Query parameter is required" });
      return;
    }

    // 1) ROUTER (no tools)
    const routeMsg = await routerPrompt.pipe(e.in.openAi).invoke({ q });
    const route = String(routeMsg.content).trim().toLowerCase();

    // 2) SPECIALISTS
    // Specialist A: web research (tool: tavily)
    const webAgent = createAgent({
      model: e.in.openAi,
      tools: [e.in.tavily],
      systemPrompt: `
                You are a web research assistant.
                Use tools when needed.
                Cite links you used in your answer.
      `.trim(),
    }); 

    // Specialist B: codebase RAG (here shown as keyword tool to keep it self-contained)
    // Replace this tool with your real vector retriever tool when ready.
    const codeSearchTool = {
      name: "code_search",
      description: "Search local codebase files by keyword",
      invoke: async ({ query }: { query: string }) => {
        // TODO: plug your real retriever here
        return [{ path: "TODO", snippet: `No retriever wired. Query was: ${query}` }];
      },
    };
    
    const codeAgent = createAgent({
      model: e.in.openAi,
      tools: [codeSearchTool],
        systemPrompt: `
                You are a Damba codebase assistant.
                Use code_search to retrieve context.
                Answer ONLY based on retrieved snippets. If none, say you don't know.
        `.trim(),
    });

    let specialistResult: any;
    if (route === "web") {
      specialistResult = await webAgent.invoke({ messages: [{ role: "user", content: q }] });
    } else {
      specialistResult = await codeAgent.invoke({ messages: [{ role: "user", content: q }] });
    }

    const last = specialistResult.messages?.at?.(-1);
    const specialistAnswer = last?.content ?? specialistResult.content ?? "";

    // 3) FINAL SYNTHESIS (optional but recommended)
    const finalPrompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant. Produce a concise final answer."],
      ["user", `Question: {q}\n\nRoute: {route}\n\nSpecialist answer:\n{a}`],
    ]);

    const finalMsg = await finalPrompt.pipe(e.in.openAi).invoke({
      q,
      route: route === "web" ? "web" : "codebase",
      a: specialistAnswer,
    });

    e.out.send({
      route: route === "web" ? "web" : "codebase",
      content: finalMsg.content,
    });
  };
};
