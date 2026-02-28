import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const RedisConnection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const connection = new IORedis({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null, // recommandé BullMQ
});

export default RedisConnection;
