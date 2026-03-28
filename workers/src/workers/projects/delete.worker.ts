import { DQueues } from '../../../../common/Damba/core/Queues';
import { DefaultLLM, startWorkers } from '..';
import { DataSource } from 'typeorm';
import { deleteProject } from './processors/deleteProject';
import { DeleteJobData, DeleteJobResult } from './deleteDtos';

(async () => {
  await startWorkers<DeleteJobData, DeleteJobResult, string, typeof DefaultLLM, DataSource>(
    DQueues.DELETE_PROJECT,
    DefaultLLM,
    deleteProject,
    { concurrency: 3 },
  );
})();
