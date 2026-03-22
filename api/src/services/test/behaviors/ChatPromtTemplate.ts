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

export interface User {
  name: string;
}

export interface User {
  age: number;
}

function x<T>(p: T) {
  return p;
}

x<number>(10);

const t = <T>(p: T) => {
  return p;
};
t<string>('bonjour');

type t<T> = (m: T) => void;

type x = <T>(m: T) => void;

type P<T, X> = {
  call: () => T;
  bind: <M>(c: X, g: M) => T;
};
