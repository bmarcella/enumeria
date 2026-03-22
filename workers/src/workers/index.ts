/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppConfig } from '../config/app.config';
import { OpenAI } from '../config/OpenAi';
import connection from '../config/redis';
import { Worker, Processor } from 'bullmq';
import type { ChatOpenAI } from '@langchain/openai';
import "reflect-metadata";
import { Database } from '@Damba/v2/config/IAppConfig';
import { DataSource } from 'typeorm';
import { initOrm } from '@Database/DataSource';

export enum DLLM {
  OPENAI = 'OPENAI',
  OLLAMA = 'OLLAMA',
  ANTHROPIC = 'ANTHROPIC',
}

export type LlmProviderMap = {
  [DLLM.OPENAI]: ChatOpenAI;
  [DLLM.OLLAMA]: unknown;
  [DLLM.ANTHROPIC]: unknown;
};

export type MakeAiAgentProcessor<D, R, X extends string = string, L = unknown> = (
  app: typeof AppConfig,
  llm: L,
  database?: Database<any>,
) => Processor<D, R, X>;

export const getLLM = <P extends DLLM>(provider: P): LlmProviderMap[P] => {
  switch (provider) {
    case DLLM.OPENAI:
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

export type WorkerPoolOptions = {
  shards?: number; // default 128
  shardStart?: number; // default 0
  shardEnd?: number; // default shards-1
  concurrency?: number; // default env WORKER_CONCURRENCY
};

export const startWorkers = async  <D, R, X extends string = string, P extends DLLM = DLLM>(
  baseQueueName: string,
  provider: P,
  makeProcessor: MakeAiAgentProcessor<D, R, X, LlmProviderMap[P]>,
  opts: WorkerPoolOptions = {}
) => {
  const llm = getLLM(provider);


  const shards = opts.shards ?? Number(process.env.QUEUE_SHARDS ?? 3);

  const shardStart = opts.shardStart ?? Number(process.env.SHARD_START ?? 0);
  const shardEnd = opts.shardEnd ?? Number(process.env.SHARD_END ?? shards - 1);
  const concurrency = opts.concurrency ?? Number(process.env.WORKER_CONCURRENCY ?? 5);

  if (shardStart < 0 || shardEnd >= shards || shardStart > shardEnd) {
    throw new Error(`Invalid shard range: ${shardStart}..${shardEnd} (shards=${shards})`);
  }

  const workers: Worker[] = [];

  for (let i = shardStart; i <= shardEnd; i++) {
    const queueName = `${baseQueueName}_${i}`;
    const database = await initOrm<DataSource>(process.env as any);
    const processor = makeProcessor(AppConfig, llm, database);
    const w = new Worker<D, R, X>(queueName, processor, {
      connection,
      concurrency,
    });

    w.on('ready', () =>
      console.log(`[worker] ready queue=${queueName} concurrency=${concurrency}`),
    );
    w.on('error', (err) => console.error(`[worker] error queue=${queueName}`, err));
    workers.push(w as any);
  }

  // graceful shutdown
  const shutdown = async () => {
    console.log('[worker] shutting down...');
    await Promise.allSettled(workers.map((w) => w.close()));
    process.exit(0);
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  console.log(
    `[worker] started pool base=${baseQueueName} shards=${shards} range=${shardStart}..${shardEnd}`,
  );

  return workers;
};

export const DefaultlLLM = DLLM.OPENAI;
