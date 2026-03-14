import { DEvent } from '@App/damba.import';
import { Behavior, DambaApi } from '@Damba/v2/service/DambaService';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const ChatPromptTemplateLangChain: Behavior = (api?: DambaApi) => {
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

// export const exampleBehavior : Behavior = (api?: DambaApi) => {
//   return async (e: DEvent) => {
//     // if you are in a different service
//     e.in.extras.{service_name}.{extra_name}({params})
//     // or in you are in the same service 
//     api?.extras.{extra_name}({params})
//     e.out.send();
//   };
// };
