/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Worker, type Processor, type ConnectionOptions } from 'bullmq';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOllama } from '@langchain/ollama';
import { DataSource } from 'typeorm';

import { AppConfig } from '../config/app.config';
import connection from '../config/redis';
import { initOrm } from '@Database/DataSource';
import { DambaRepository } from '@Damba/v2/dao';
import { mustEnv } from '@Damba/v2/config/ConfigHelper';

export enum DLLM {
  OPENAI = 'OPENAI',
  OLLAMA = 'OLLAMA',
  ANTHROPIC = 'ANTHROPIC',
}

export const DefaultLLM = DLLM.ANTHROPIC;

export type OpenAiLlm = ChatOpenAI;
export type OllamaLlm = any;
export type AnthropicLlm = ChatAnthropic;

export type LlmProviderMap = {
  [DLLM.OPENAI]: OpenAiLlm;
  [DLLM.OLLAMA]: OllamaLlm;
  [DLLM.ANTHROPIC]: AnthropicLlm;
};

export type MakeAiAgentProcessor<D, R, X extends string = string, L = unknown, DAO = unknown> = (
  app: typeof AppConfig,
  llm: L,
  dao?: DambaRepository<DAO>,
) => Processor<D, R, X>;

export const getLLM = <P extends DLLM>(
  provider: P,
  apiKey: string | undefined,
): LlmProviderMap[P] => {
  switch (provider) {
    case DLLM.OPENAI:
      if (!apiKey) throw new Error('OPENAI_API_KEY is not defined');
      return new ChatOpenAI({
        apiKey,
        model: 'gpt-4o-mini',
        temperature: 1,
      }) as LlmProviderMap[P];

    case DLLM.OLLAMA:
      return new ChatOllama({
        model: 'qwen2.5-coder:32b-instruct',
        temperature: 0,
      }) as LlmProviderMap[P];

    case DLLM.ANTHROPIC:
      if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not defined');
      return new ChatAnthropic({
        model: 'claude-sonnet-4-5',
        anthropicApiKey: apiKey,
        temperature: 0,
        maxRetries: 6,
      }) as LlmProviderMap[P];

    default: {
      const exhaustiveCheck: never = provider;
      throw new Error(`Unknown LLM provider: ${exhaustiveCheck}`);
    }
  }
};

export type WorkerPoolOptions = {
  shards?: number;
  shardStart?: number;
  shardEnd?: number;
  concurrency?: number;
};

/**
 * Prefer passing BullMQ Redis connection options here, not a live ioredis singleton.
 * If ../config/redis currently exports an ioredis instance, consider changing it to:
 *   export default {
 *     host: process.env.REDIS_HOST ?? "127.0.0.1",
 *     port: Number(process.env.REDIS_PORT ?? 6379),
 *     maxRetriesPerRequest: null,
 *   } satisfies ConnectionOptions;
 */
const redisConnection = connection as ConnectionOptions;

export const startWorkers = async <
  D,
  R,
  X extends string = string,
  P extends DLLM = DLLM,
  DAO = unknown,
>(
  baseQueueName: string,
  provider: P,
  makeProcessor: MakeAiAgentProcessor<D, R, X, LlmProviderMap[P], DAO>,
  opts: WorkerPoolOptions = {},
): Promise<Array<Worker<D, R, X>>> => {
  const aiApiKey = provider === DLLM.OLLAMA ? undefined : mustEnv(`${provider}_API_KEY`);

  const llm = getLLM(provider, aiApiKey);

  const shards = opts.shards ?? Number(process.env.QUEUE_SHARDS ?? 3);
  const shardStart = opts.shardStart ?? Number(process.env.SHARD_START ?? 0);
  const shardEnd = opts.shardEnd ?? Number(process.env.SHARD_END ?? shards - 1);
  const concurrency = opts.concurrency ?? Number(process.env.WORKER_CONCURRENCY ?? 5);

  if (
    !Number.isInteger(shards) ||
    !Number.isInteger(shardStart) ||
    !Number.isInteger(shardEnd) ||
    shards <= 0 ||
    shardStart < 0 ||
    shardEnd >= shards ||
    shardStart > shardEnd
  ) {
    throw new Error(`Invalid shard range: ${shardStart}..${shardEnd} (shards=${shards})`);
  }

  // Initialize DB once for the whole pool, not once per worker
  const database = await initOrm<DataSource>(process.env as Record<string, string>);
  const repo = DambaRepository.init(database.dataSource);

  const workers: Array<Worker<D, R, X>> = [];

  for (let i = shardStart; i <= shardEnd; i++) {
    const queueName = `${baseQueueName}_${i}`;
    const processor = makeProcessor(AppConfig, llm, repo);

    const worker = new Worker<D, R, X>(queueName, processor, {
      connection: redisConnection,
      concurrency,
      autorun: true,
      // Allow jobs to run for up to 30 minutes before being considered stalled.
      // LLM pipelines with retries on rate-limit can legitimately take a long time.
      stalledInterval: 60_000, // check for stalled jobs every 60 s (default: 30 s)
      maxStalledCount: 30, // allow 30 missed heartbeats (~30 min) before marking stalled
    });

    worker.on('ready', () => {
      console.log(`[worker] ready queue=${queueName} concurrency=${concurrency}`);
    });

    worker.on('active', (job) => {
      console.log(`[worker] active queue=${queueName} jobId=${job.id}`);
    });

    worker.on('completed', (job) => {
      console.log(`[worker] completed queue=${queueName} jobId=${job.id}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[worker] failed queue=${queueName} jobId=${job?.id ?? 'unknown'}`, err);
    });

    worker.on('error', (err) => {
      console.error(`[worker] error queue=${queueName}`, err);
    });

    worker.on('closing', () => {
      console.log(`[worker] closing queue=${queueName}`);
    });

    worker.on('closed', () => {
      console.log(`[worker] closed queue=${queueName}`);
    });

    workers.push(worker);
  }

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`[worker] shutting down... signal=${signal}`);

    await Promise.allSettled(workers.map((worker) => worker.close()));

    if (database?.dataSource?.isInitialized) {
      await database.dataSource.destroy();
    }

    console.log('[worker] shutdown complete');
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT').finally(() => process.exit(0));
  });

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM').finally(() => process.exit(0));
  });

  console.log(
    `[worker] started pool base=${baseQueueName} shards=${shards} range=${shardStart}..${shardEnd}`,
  );

  return workers;
};
