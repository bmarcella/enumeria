/* eslint-disable @typescript-eslint/no-explicit-any */
import IORedis, { Redis, RedisOptions } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const useTls = process.env.REDIS_TLS === "true";

function buildRedisOptions(): RedisOptions {
  return {
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: Number(process.env.REDIS_PORT ?? 6379),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null, // recommended for BullMQ
    enableReadyCheck: true,
    lazyConnect: false,
    connectTimeout: 10000,
    keepAlive: 30000,
    retryStrategy(times: number) {
      const base = Math.min(2 ** times * 100, 3000);
      const jitter = Math.random() * 200;
      return base + jitter;
    },
    reconnectOnError(err: Error) {
      const message = err.message || "";
      return (
        message.includes("ECONNRESET") ||
        message.includes("ECONNABORTED") ||
        message.includes("ETIMEDOUT") ||
        message.includes("READONLY")
      );
    },
    ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
  };
}

function attachRedisListeners(conn: Redis, name: string): void {
  conn.on("connect", () => {
    console.log(`[Redis ${name}] connecting`);
  });

  conn.on("ready", () => {
    console.log(`[Redis ${name}] ready`);
  });

  conn.on("error", (err: Error) => {
    console.error(`[Redis ${name}] error:`, err.message);
  });

  conn.on("close", () => {
    console.warn(`[Redis ${name}] connection closed`);
  });

  conn.on("reconnecting", (delay: number) => {
    console.warn(`[Redis ${name}] reconnecting in ${delay}ms`);
  });

  conn.on("end", () => {
    console.warn(`[Redis ${name}] connection ended`);
  });
}

function makeRedisConnection(name: string): Redis {
  const conn = redisUrl
    ? new IORedis(redisUrl, buildRedisOptions())
    : new IORedis(buildRedisOptions());

  attachRedisListeners(conn, name);
  return conn;
}

/**
 * Shared singleton for Queue / general non-blocking commands.
 */
export const connection = makeRedisConnection("default");

/**
 * Creates a brand-new dedicated ioredis connection.

 * Use this for:
 * - QueueEvents
 * - Worker if you want isolation
 * - any blocking/subscriber-style Redis usage
 */
export function createRedisConnection(name = "dedicated"): Redis {
  return makeRedisConnection(name);
}

async function shutdown(): Promise<void> {
  try {
    await connection.quit();
  } catch {
    connection.disconnect();
  }
}

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

export default connection;