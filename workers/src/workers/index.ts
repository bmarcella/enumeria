import { AppConfig } from '../config/app.config';
import { OpenAI } from '../config/OpenAi';
import connection from '../config/redis';
import { Worker, Processor } from 'bullmq';
import type { ChatOpenAI } from '@langchain/openai';

export enum DLLM {
  OPENAI = 'OPENAI',
  OLLAMA = 'OLLAMA',
  ANTHROPIC = 'ANTHROPIC',
}

/**
 * IMPORTANT:
 * These should be the *runtime values you pass to processors* (instances/config objects),
 * NOT constructors (typeof Something).
 */
export type LlmProviderMap = {
  [DLLM.OPENAI]: ChatOpenAI; // or `typeof OpenAI` ONLY if OpenAI is a class you pass around
  [DLLM.OLLAMA]: unknown;
  [DLLM.ANTHROPIC]: unknown;
};

export type MakeAiAgentProcessor<D, R, X extends string = string, L = unknown> = (
  app: typeof AppConfig,
  llm: L,
) => Processor<D, R, X>;

export const getLLM = <P extends DLLM>(provider: P): LlmProviderMap[P] => {
  switch (provider) {
    case DLLM.OPENAI:
      // If OpenAI is already a ChatOpenAI instance, this is correct:
      return OpenAI as LlmProviderMap[P];

    case DLLM.OLLAMA:
      throw new Error(`LLM provider not implemented: ${provider}`);

    case DLLM.ANTHROPIC:
      throw new Error(`LLM provider not implemented: ${provider}`);

    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unknown LLM provider: ${_exhaustive}`);
    }
  }
};

export const startWorker = <D, R, X extends string = string, P extends DLLM = DLLM>(
  name: string,
  provider: P,
  makeProcessor: MakeAiAgentProcessor<D, R, X, LlmProviderMap[P]>,
) => {
  const llm = getLLM(provider);

  return new Worker<D, R, X>(name, makeProcessor(AppConfig, llm), {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5),
  });
};

export const DefaultlLLM = DLLM.OPENAI;