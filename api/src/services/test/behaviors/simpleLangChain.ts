/* eslint-disable @typescript-eslint/no-explicit-any */
import { PromptTemplate } from '@langchain/core/prompts';
import { DEvent } from '@App/damba.import';
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

    const response: any = await chain.invoke({
      topic: 'LangChain prompt templates',
      tone: 'beginner-friendly',
    });

    e.out.send({
      answer: response.content,
    });
  };
};
