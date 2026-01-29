/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from "@App/damba.import";
import { DambaApi, DEventHandlerFactory } from "@Damba/v2/service/DambaService";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const ActionSchema = z.object({
  tool: z.enum(["tavily_search"]),
  args: z.object({
    query: z.string().min(1),
    maxResults: z.number().int().min(1).max(10).optional(),
  }),
});

const PlanSchema = z.object({
  actions: z.array(ActionSchema).min(1).max(3),
});

const toolOnlyPrompt = ChatPromptTemplate.fromMessages([
  ["system", `
You are a tool-only agent.
Return ONLY valid JSON matching:
{ "actions": [{ "tool": "tavily_search", "args": { "query": string, "maxResults"?: number } }] }

Rules:
- No prose, no markdown, JSON only.
- Use only the allowed tool: tavily_search.
- 1 to 3 actions max.
`.trim()],
  ["user", "{request}"],
]);

export const toolOnlySearchBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const request = api?.params().query;
    if (!request) {
      e.out.status(400).send({ error: "Query parameter is required" });
      return;
    }

    // 1) Ask LLM for an action plan (JSON)
    const planner = toolOnlyPrompt.pipe(e.in.openAi);
    const planMsg = await planner.invoke({ request });

    let plan: z.infer<typeof PlanSchema>;
    try {
      plan = PlanSchema.parse(JSON.parse(String(planMsg.content)));
    } catch (err: any) {
      e.out.status(422).send({
        error: "Invalid tool plan from LLM",
        detail: err?.message ?? String(err),
        raw: planMsg.content,
      });
      return;
    }

    // 2) Execute allowed tools only
    const results: any[] = [];
    for (const action of plan.actions) {
      if (action.tool === "tavily_search") {
        const maxResults = action.args.maxResults ?? 5;
        const res = await e.in.tavily.invoke({ query: action.args.query, maxResults });
        results.push({ tool: "tavily_search", input: action.args, output: res });
      }
    }

    // 3) Return structured output (no hallucinations)
    e.out.send({
      request,
      plan,
      results,
    });
  };
};
