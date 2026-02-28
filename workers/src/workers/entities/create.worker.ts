import { DQueues } from '../../../../common/Damba/core/Queues';
import { DefaultlLLM,  isTransient,  LlmProviderMap, MakeAiAgentProcessor, sleep, startWorker } from '..';
import {  UnrecoverableError } from 'bullmq';
import { JobData, JobResult } from './dtos';



async function runAgent(job: any) {
  const { requestId, prompt } = job.data as { requestId: string; prompt: string };

  await job.updateProgress({ requestId, step: 'start', pct: 5, message: 'Starting agent' });

  // Step 1: plan
  await sleep(500);
  await job.updateProgress({ requestId, step: 'plan', pct: 20, message: 'Planning steps' });

  // Step 2: tool call (simulate API)
  await sleep(800);
  await job.updateProgress({ requestId, step: 'tool', pct: 55, message: 'Calling tools' });

  // Step 3: compose answer
  await sleep(900);
  await job.updateProgress({ requestId, step: 'compose', pct: 85, message: 'Composing output' });

  // done
  await sleep(300);
  return { requestId, answer: `AI result for: ${prompt}` };
}

const agent: MakeAiAgentProcessor<JobData, JobResult, string, LlmProviderMap[typeof DefaultlLLM]> = (
  config,
  llm,
) => {
  return async (job) => {

    try {
      const {  conversation_id } = job.data;
      const answer = await runAgent(job);
      return { conversation_id , request_id: answer.requestId , answer: answer.answer };
    } catch (err) {
      // Retrying only on transient errors
      if (isTransient(err)) throw err;
      // Non-transient => pas de retry
      throw new UnrecoverableError((err as any)?.message ?? 'Unrecoverable error');
    }
  };
};

startWorker<JobData, JobResult, string, typeof DefaultlLLM>(DQueues.CREATE_ENTITIES, DefaultlLLM, agent);
