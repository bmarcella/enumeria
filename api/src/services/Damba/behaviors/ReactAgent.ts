/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from '@App/damba.import';
import { DambaApi, DEventHandlerFactory } from '@Damba/v2/service/DambaService';
import { createAgent, SystemMessage } from 'langchain';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { LoadFiles, IDambaFile } from '@Damba/v2/helper/readFile';
import { resolve } from 'path';
import z from 'zod';

const AnswerSchema = z.object({
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.object({ title: z.string(), url: z.string() })).default([]),
});

export const ChatPromptTemplateLangChain: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant.'],
      ['user', 'Explain {topic} clearly. Use a {tone} tone.'],
    ]);

    const topic = api?.params().query;
    const structuredLlm = e.in.openAi.withStructuredOutput(AnswerSchema);
    const chain = prompt.pipe(structuredLlm);

    const response: any = await chain.invoke({
      topic: topic,
      tone: 'beginner-friendly',
    });
       // Dernière réponse (finale)
    const last = response.messages?.at?.(-1);
    const content = last?.content ?? response.content ?? '';

    e.out.send({
      answer: content,
      topic: topic,
    });
  };
};

export const reactAgentSimpleSearchBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const tool = e.in.tavily;
    const query = api?.extras?.helper.getQuery();
    if (!query) {
      e.out.status(400).send({ error: 'Query parameter is required' });
      return;
    }
    const results = await tool.invoke({ query: query });
    e.out.send(results);
  };
};

export const searchBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const tool = e.in.tavily;
    const llm = e.in.openAi;
    const tools = [tool];
    const query = api?.params().query;

    if (!query) {
      e.out.status(400).send({ error: 'Query parameter is required' });
      return;
    }

    const agent = createAgent({
      model: llm,
      tools,
      systemPrompt: 'You are a helpful assistant. Use tools when they help.',
    });

    const result: any = await agent.invoke({
      messages: [{ role: 'user', content: query }],
    });
    e.out.send(result);
  };
};

export const addChatBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    try {
      const files = (await LoadFiles(
        resolve(process.cwd(), '../common/Damba/v2'),
      )) as IDambaFile[];

      const efiles = (await LoadFiles(
        resolve(process.cwd(), '../common/Damba/example'),
      )) as IDambaFile[];

      const damba: any = [
        [
          'system',
          'You are a helpful assistant and  an expert of Damba which is a nodejs framework.',
        ],
        [
          'system',
          'I will provide you the core code of damba. I want you to learn from it and become an expert ',
        ],
      ];

      for (const f of files) {
        damba.push(
          new SystemMessage(` Here is a part of the codebase:
              ${f.content}`),
        );
      }
      damba.push([
        'system',
        'after learning from the codebase, now learn this example project built with Damba.',
      ]);

      for (const f of efiles) {
        damba.push(
          new SystemMessage(` Here is a part of the example project:
              ${f.content}`),
        );
      }
      damba.push(
        new SystemMessage(
          `after learning from the codebase and the example project, now answer the question asked based on your knowledge of Damba and the codebase provided. And help the user to improve his Damba project or the new project. If the question is not related to Damba or the codebase, respond that you are specialized only in Damba related topics.`,
        ),
      );
      damba.push(['user', '{topic}']);
      const prompt = ChatPromptTemplate.fromMessages(damba);
      const topic = api?.params().query;
      const chain = prompt.pipe(e.in.openAi);
      const response = await chain.invoke({
        topic: topic,
      });
      e.out.send({
        content: response.content,
      });
    } catch (error: any) {
      console.error('LLM backend failed:', error);
      return e.out.status(503).send({
        error: 'LLM backend failed',
        detail: error?.message ?? String(error),
      });
    }
  };
};

export const SimpleLangChain = () => {
  return async (e: DEvent) => {
    const prompt = new PromptTemplate({
      template: `
          You are a helpful assistant.
          Explain {topic} clearly.
          Use a {tone} tone.
       `,
      inputVariables: ['topic', 'tone'],
    });

    const chain = prompt.pipe(e.in.ollama);

    const response = await chain.invoke({
      topic: 'LangChain prompt templates',
      tone: 'beginner-friendly',
    });

    e.out.send({
      answer: response.content,
    });
  };
};
