/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentExecutionPlan, AgentSubAgent, AgentToolConfig } from "@Damba/core/AgentDefType";
import type { ChatOpenAI } from "@langchain/openai";
import { buildExecutionRegistry } from "../runtime/buildExecutionRegistry";

function getSubAgentById(executionPlan: AgentExecutionPlan, subAgentId: string): AgentSubAgent {
  const subAgent = (executionPlan.manifest.subAgents ?? []).find((x) => x.id === subAgentId);
  if (!subAgent) {
    throw new Error(`SubAgent not found: ${subAgentId}`);
  }
  return subAgent;
}

function getAllowedToolsForSubAgent(
  executionPlan: AgentExecutionPlan,
  subAgent: AgentSubAgent
): AgentToolConfig[] {
  const allTools = executionPlan.manifest.tools ?? [];
  const allowedToolNames = new Set(subAgent.tools ?? []);
  return allTools.filter((t) => allowedToolNames.has(t.name) && t.enabled !== false);
}

function tryParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function callStructuredModel(args: {
  llm: ChatOpenAI;
  systemPrompt: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
}) {
  const { llm, systemPrompt, messages } = args;

  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    ...messages,
  ]);

  const text =
    typeof response.content === "string"
      ? response.content
      : Array.isArray(response.content)
      ? response.content
          .map((x: any) => (typeof x === "string" ? x : x?.text ?? ""))
          .join("\n")
      : "";

  return text.trim();
}

export async function runSubAgentWithOpenAI(args: {
  llm: ChatOpenAI;
  executionPlan: AgentExecutionPlan;
  subAgentId: string;
  input: any;
  agentCtx: any;
}) {
  const { llm, executionPlan, subAgentId, input, agentCtx } = args;

  const subAgent = getSubAgentById(executionPlan, subAgentId);
  const allowedTools = getAllowedToolsForSubAgent(executionPlan, subAgent);

  const maxIterations = Math.max(1, subAgent.maxIterations ?? 6);

  // On construit un registry pour exécuter les tools autorisés du subAgent
  const { toolRegistry } = await buildExecutionRegistry({
    executionPlan,
    agentCtx,
    runSubAgent: async () => {
      throw new Error("Nested subAgent execution is not allowed inside tool registry");
    },
  });

  const allowedToolNames = new Set(allowedTools.map((t) => t.name));

  const toolsDescription =
    allowedTools.length > 0
      ? allowedTools
          .map((t) => `- ${t.name} (${t.type})`)
          .join("\n")
      : "No tools available.";

  const systemPrompt = `
${subAgent.systemPrompt ?? "You are a helpful AI sub-agent."}

You operate in iterative mode.

You MUST answer with valid JSON only.

Allowed outputs:

1) Final answer:
{
  "type": "final",
  "output": any
}

2) Tool call:
{
  "type": "tool_call",
  "toolName": "string",
  "input": any
}

Rules:
- Use only tools explicitly allowed to you.
- If you call a tool, return only one tool call at a time.
- When enough information is available, return type="final".
- Never output markdown.
- Never wrap JSON in code fences.

Allowed tools:
${toolsDescription}
`.trim();

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    {
      role: "user",
      content: JSON.stringify(
        {
          taskInput: input,
        },
        null,
        2
      ),
    },
  ];

  const traces: any[] = [];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const raw = await callStructuredModel({
      llm,
      systemPrompt,
      messages,
    });

    const parsed = tryParseJson(raw);

    if (!parsed || typeof parsed !== "object") {
      throw new Error(
        `SubAgent "${subAgentId}" returned invalid JSON at iteration ${iteration + 1}`
      );
    }

    // FINAL
    if (parsed.type === "final") {
      return {
        subAgentId,
        iterations: iteration + 1,
        traces,
        output: parsed.output,
      };
    }

    // TOOL CALL
    if (parsed.type === "tool_call") {
      const toolName = parsed.toolName;
      const toolInput = parsed.input ?? {};

      if (!toolName || typeof toolName !== "string") {
        throw new Error(`SubAgent "${subAgentId}" returned tool_call without valid toolName`);
      }

      if (!allowedToolNames.has(toolName)) {
        throw new Error(
          `SubAgent "${subAgentId}" attempted unauthorized tool "${toolName}"`
        );
      }

      const toolHandler = toolRegistry[toolName];
      if (!toolHandler) {
        throw new Error(`Tool "${toolName}" not found in tool registry`);
      }

      const toolResult = await toolHandler(toolInput);

      traces.push({
        iteration: iteration + 1,
        type: "tool_call",
        toolName,
        toolInput,
        toolResult,
      });

      messages.push({
        role: "assistant",
        content: JSON.stringify(parsed, null, 2),
      });

      messages.push({
        role: "user",
        content: JSON.stringify(
          {
            toolResult,
            instruction:
              "Continue. If more tool usage is needed, return another tool_call. Otherwise return final.",
          },
          null,
          2
        ),
      });

      continue;
    }

    throw new Error(
      `SubAgent "${subAgentId}" returned unsupported response type: ${parsed.type}`
    );
  }

  throw new Error(
    `SubAgent "${subAgentId}" exceeded maxIterations=${maxIterations}`
  );
}