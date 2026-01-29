/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from '@App/damba.import';
import { IDambaFile, LoadFiles } from '@Damba/v2/helper/readFile';
import { DEventHandlerFactory, DambaApi } from '@Damba/v2/service/DambaService';
import { SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { resolve } from 'path';

export const addChatBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    console.log("e.in.ollama model =", (e.in.ollama as any)?.model);
    try {
      const files = (await LoadFiles(
        resolve(process.cwd(), '../common/Damba/v2'),
      )) as IDambaFile[];
      console.log(` Loaded ${files.length} files for context.`);

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
      const topic = api?.body().prompt;
      const chain = prompt.pipe(e.in.ollama);

      const response = await chain.invoke({
        topic: topic,
      });

      e.out.send(response);
    } catch (error: any) {
      console.error('LLM backend failed:', error);
      return e.out.status(503).send({
        error: 'LLM backend failed',
        detail: error?.message ?? String(error),
      });
    }
  };
};
