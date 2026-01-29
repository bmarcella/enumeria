/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from '@App/damba.import';
import { DambaApi, DEventHandlerFactory } from '@Damba/v2/service/DambaService';
import { createAgent } from 'langchain';
import { ChatPromptTemplate } from 'node_modules/@langchain/core/dist/prompts/chat.cjs';
import z from 'zod';

export const simpleAgentBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const query = api?.params().query;

    if (!query) {
      e.out.status(400).send({ error: 'Query parameter is required' });
      return;
    }

    // LLM
    const llm = e.in.openAi;

    // Tool optionnel
    const tools = [e.in.tavily];

    // Agent simple
    const agent = createAgent({
      model: llm,
      tools,
      systemPrompt: 'You are a helpful assistant. Use tools only if necessary.',
    });

    // Appel
    const result: any = await agent.invoke({
      messages: [{ role: 'user', content: query }],
    });

    // Récupérer la réponse finale
    const lastMessage = result.messages?.at?.(-1);
    const content = lastMessage?.content ?? result.content ?? '';

    e.out.send({ content });
  };
};

export const multiStepAgentBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const query = api?.params().query;

    if (!query) {
      e.out.status(400).send({ error: 'Query parameter is required' });
      return;
    }

    const llm = e.in.openAi;
    const tools = [e.in.tavily];

    const agent = createAgent({
      model: llm,
      tools,
      systemPrompt: `
You are a research assistant.
Follow these steps:
1. Search for relevant information.
2. If results are insufficient, refine the search.
3. Compare the findings.
4. Produce a concise final answer.
Use tools when useful.
      `,
    });

    const result: any = await agent.invoke({
      messages: [{ role: 'user', content: query }],
    });

    // Dernière réponse (finale)
    const last = result.messages?.at?.(-1);
    const content = last?.content ?? result.content ?? '';

    e.out.send({
      query,
      content,
    });
  };
};

export const statefulAgentBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const query = api?.params().query;

    if (!query) {
      e.out.status(400).send({ error: 'Query parameter is required' });
      return;
    }

    const agent = createAgent({
      model: e.in.openAi,
      tools: [e.in.tavily],
      systemPrompt: `
You are a helpful assistant.
You may use tools.
Return a final answer after you are done.
      `.trim(),
    });

    const state: any = await agent.invoke({
      messages: [{ role: 'user', content: query }],
    });

    // ✅ Réponse finale = dernier message
    const last = state.messages?.at?.(-1);
    const content = last?.content ?? state.content ?? '';

    // ✅ Extraire un mini “trace” (safe) : tools utilisés + urls
    const toolSteps = (state.messages ?? [])
      .filter((m: any) => m?.id?.includes?.('ToolMessage') || m?.kwargs?.tool_call_id || m?.name)
      .map((m: any) => {
        // ToolMessage de Tavily contient un JSON string dans content
        if (typeof m?.kwargs?.content === 'string') {
          try {
            const data = JSON.parse(m.kwargs.content);
            return {
              tool: m.kwargs.name ?? m.name ?? 'tool',
              query: data.query,
              results: (data.results ?? []).slice(0, 3).map((r: any) => ({
                title: r.title,
                url: r.url,
              })),
            };
          } catch {
            return { tool: m.kwargs.name ?? m.name ?? 'tool', note: 'Could not parse tool output' };
          }
        }
        return { tool: m?.kwargs?.name ?? m?.name ?? 'tool' };
      });

    e.out.send({
      query,
      content, // ✅ réponse finale
      toolSteps, // ✅ état “résumé”
      // state,     // ❌ évite d’envoyer tout l’état en prod (très verbeux / potentiellement sensible)
    });
  };
};


