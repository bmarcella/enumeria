/* eslint-disable @typescript-eslint/no-explicit-any */
import { DambaApi, DEventHandlerFactory } from '@Damba/v2/service/DambaService';
import { DEvent } from '@Damba/v2/service/DEvent';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import z from 'zod';

/**
 * Zod schema for the planner output
 */
const PlanSchema = z.object({
  goal: z.string().min(1),
  steps: z
    .array(
      z.object({
        id: z.number(),
        action: z.string().min(1),
      }),
    )
    .min(1)
    .max(6),
});

type Plan = z.infer<typeof PlanSchema>;

/**
 * Planner prompt: JSON-only plan
 */
const plannerPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
You are a planner.
Return ONLY valid JSON that matches this schema exactly:
{
  "goal": string,
  "steps": [{ "id": number, "action": string }]
}
Rules:
- 3 to 6 steps max (unless the task is very small)
- No markdown
- No explanations
- JSON only
`.trim(),
  ],
  ['user', '{query}'],
]);

/**
 * Synthesis prompt: final answer from gathered tool outputs
 */
const synthesisPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
You are a helpful assistant.
Write a concise final answer.
- Use bullet points when useful
- Include links if present in the data
- Be factual; do not invent sources
`.trim(),
  ],
  ['user', `Goal: {goal}\n\nData:\n{data}`],
]);

/**
 * Damba Behavior: Planner/Executor using Zod parsing
 *
 * - Phase 1: Planner (LLM) generates a JSON plan
 * - Phase 2: Executor runs tools in a controlled way (no free-form tool choice)
 * - Phase 3: Synthesizer (LLM) writes final answer based on gathered data
 */
export const plannerExecutorWithZodBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const query = api?.params().query;

    if (!query) {
      e.out.status(400).send({ error: 'Query parameter is required' });
      return;
    }

    const llm = e.in.openAi; // ChatOpenAI injected
    const tavily = e.in.tavily; // TavilySearch injected

    // ----------------------------
    // PHASE 1: PLAN (LLM -> JSON)
    // ----------------------------
    const plannerChain = plannerPrompt.pipe(llm);
    const planMsg: any = await plannerChain.invoke({ query });

    let plan: Plan;

    try {
      const raw = JSON.parse(String(planMsg.content ?? '').trim());
      plan = PlanSchema.parse(raw);
    } catch (err) {
      // Fallback plan if JSON is invalid
      console.error('Planner output invalid; using fallback plan.', err);

      plan = {
        goal: query,
        steps: [
          { id: 1, action: `Search the web for: ${query}` },
          { id: 2, action: `Summarize the key findings with links` },
        ],
      };
    }

    // ----------------------------
    // PHASE 2: EXECUTE (controlled)
    // ----------------------------
    const gathered: any[] = [];
    const trace: Array<{
      stepId: number;
      action: string;
      toolUsed?: string;
      queryUsed?: string;
      topResults?: Array<{ title: string; url: string }>;
      note?: string;
      error?: string;
    }> = [];

    // Helper: safe string check
    const includesAny = (s: string, words: string[]) =>
      words.some((w) => s.toLowerCase().includes(w));

    for (const step of plan.steps) {
      const action = step.action.trim();

      try {
        // Simple rule-based executor:
        // - If step says "search", run Tavily on the original query
        //   (you can extend this to extract a refined query from `action`)
        if (includesAny(action, ['search', 'lookup', 'find', 'research'])) {
          const res = await tavily.invoke({ query });

          gathered.push({
            stepId: step.id,
            action,
            tool: 'tavily_search',
            output: res,
          });

          trace.push({
            stepId: step.id,
            action,
            toolUsed: 'tavily_search',
            queryUsed: query,
            topResults: (res?.results ?? []).slice(0, 5).map((r: any) => ({
              title: r.title,
              url: r.url,
            })),
          });

          continue;
        }

        // For non-tool steps, we just record that we skipped execution.
        trace.push({
          stepId: step.id,
          action,
          note: 'No tool execution rule matched for this step (skipped).',
        });
      } catch (toolErr: any) {
        trace.push({
          stepId: step.id,
          action,
          error: toolErr?.message ?? String(toolErr),
        });
      }
    }

    // ----------------------------
    // PHASE 3: SYNTHESIZE (LLM)
    // ----------------------------
    const synthChain = synthesisPrompt.pipe(llm);

    // Avoid huge token payloads
    const data = JSON.stringify(gathered).slice(0, 12000);

    const finalMsg: any = await synthChain.invoke({
      goal: plan.goal,
      data,
    });

    // ----------------------------
    // RESPONSE
    // ----------------------------
    e.out.send({
      query,
      plan, // Zod-validated plan
      content: finalMsg.content,
      trace, // optional: safe debug trace
    });
  };
};
