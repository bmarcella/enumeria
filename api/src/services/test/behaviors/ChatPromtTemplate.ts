import { DEvent } from '@App/damba.import';
import { CreateBehaviorsReturn, DEventHandlerFactory } from '@Damba/v2/service/DambaService';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const ChatPromptTemplateLangChain: DEventHandlerFactory = (api?: CreateBehaviorsReturn) => {
  return async (e: DEvent) => {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant.'],
      ['user', 'Explain {topic} clearly. Use a {tone} tone.'],
    ]);
    const topic = api?.params().subject;
    const chain = prompt.pipe(e.in.ollama);

    const response = await chain.invoke({
      topic: topic,
      tone: 'beginner-friendly',
    });
    e.out.send({
      answer: response.content,
      topic: topic,
    });
  };
};
