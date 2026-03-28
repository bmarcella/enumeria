/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DQueues } from '../../../../common/Damba/core/Queues';
import { DefaultLLM, startWorkers } from '..';
import { JobData, JobResult } from './dtos';
import { createNewProject } from './processors';
import { DataSource } from 'typeorm';

(async () => {
  await startWorkers<JobData, JobResult, string, typeof DefaultLLM, DataSource>(
    DQueues.CREATE_PROJECT,
    DefaultLLM,
    createNewProject,
    {
      // One job at a time per shard — each job makes many sequential LLM calls,
      // running multiple concurrently burns through the rate limit.
      concurrency: 1,
    },
  );
})();
