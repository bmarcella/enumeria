/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DQueues } from '../../../../common/Damba/core/Queues';
import { DefaultlLLM, startWorkers } from '..';
import { JobData, JobResult } from './dtos';
import { createNewProject } from './processors';
import { DataSource } from 'typeorm';


(async () => {
  await startWorkers<JobData, JobResult, string, typeof DefaultlLLM, DataSource>(
    DQueues.CREATE_PROJECT,
    DefaultlLLM,
    createNewProject,
  );
})();


