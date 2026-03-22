/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { Worker, type Processor } from "bullmq";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { DataSource } from "typeorm";

import { AppConfig } from "../config/app.config";
import connection from "../config/redis";
import { initOrm } from "@Database/DataSource";
import { DambaRepository } from "@Damba/v2/dao";
import { mustEnv } from "@Damba/v2/config/ConfigHelper";

export enum DLLM {
  OPENAI = "OPENAI",
  OLLAMA = "OLLAMA",
  ANTHROPIC = "ANTHROPIC",
}

export const DefaultlLLM = DLLM.ANTHROPIC;

export type OpenAiLlm = ChatOpenAI;

export type OllamaLlm = any;

export type AnthropicLlm = ChatAnthropic;

export type LlmProviderMap = {
  [DLLM.OPENAI]: OpenAiLlm;
  [DLLM.OLLAMA]: OllamaLlm;
  [DLLM.ANTHROPIC]: AnthropicLlm;
};

export type MakeAiAgentProcessor<
  D,
  R,
  X extends string = string,
  L = unknown,
  DAO = unknown
> = (
  app: typeof AppConfig,
  llm: L,
  dao?: DambaRepository<DAO>
) => Processor<D, R, X>;

export const getLLM = <P extends DLLM>(
  provider: P,
  apiKey: string
): LlmProviderMap[P] => {
  switch (provider) {
    case DLLM.OPENAI:
      return new ChatOpenAI({
        apiKey,
        model: "gpt-4o-mini",
        temperature: 1,
      }) as LlmProviderMap[P];
    case DLLM.OLLAMA:
      throw new Error(`LLM provider not implemented: ${provider}`);
    case DLLM.ANTHROPIC:
      const llm = new ChatAnthropic({
        model: "claude-sonnet-4-5",
        anthropicApiKey: apiKey,
        temperature: 0,
      });
      return llm as LlmProviderMap[P];
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unknown LLM provider: ${_exhaustive}`);
    }
  }
};

export type WorkerPoolOptions = {
  shards?: number;
  shardStart?: number;
  shardEnd?: number;
  concurrency?: number;
};

export const startWorkers = async <
  D,
  R,
  X extends string = string,
  P extends DLLM = DLLM,
  DAO = unknown
>(
  baseQueueName: string,
  provider: P,
  makeProcessor: MakeAiAgentProcessor<D, R, X, LlmProviderMap[P], DAO>,
  opts: WorkerPoolOptions = {}
): Promise<Array<Worker<D, R, X>>> => {
  const aiApiKey = mustEnv(`${provider}_API_KEY`);
  const llm = getLLM(provider, aiApiKey);
  const shards = opts.shards ?? Number(process.env.QUEUE_SHARDS ?? 3);
  const shardStart = opts.shardStart ?? Number(process.env.SHARD_START ?? 0);
  const shardEnd = opts.shardEnd ?? Number(process.env.SHARD_END ?? shards - 1);
  const concurrency =
    opts.concurrency ?? Number(process.env.WORKER_CONCURRENCY ?? 5);

  if (shardStart < 0 || shardEnd >= shards || shardStart > shardEnd) {
    throw new Error(
      `Invalid shard range: ${shardStart}..${shardEnd} (shards=${shards})`
    );
  }

  const workers: Array<Worker<D, R, X>> = [];

  for (let i = shardStart; i <= shardEnd; i++) {
    const queueName = `${baseQueueName}_${i}`;

    const database = await initOrm<DataSource>(process.env as any);

    const repo = DambaRepository.init(database.dataSource);
    const processor = makeProcessor(AppConfig, llm, repo);
    const worker = new Worker<D, R, X>(queueName, processor, {
      connection,
      concurrency,
    });
    worker.on("ready", () => {
      console.log(
        `[worker] ready queue=${queueName} concurrency=${concurrency}`
      );
    });

    worker.on("error", (err) => {
      console.error(`[worker] error queue=${queueName}`, err);
    });
    workers.push(worker);
  }

  const shutdown = async () => {
    console.log("[worker] shutting down...");
    await Promise.allSettled(workers.map((worker) => worker.close()));
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  console.log(
    `[worker] started pool base=${baseQueueName} shards=${shards} range=${shardStart}..${shardEnd}`
  );

  return workers;
};