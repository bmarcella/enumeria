/* eslint-disable @typescript-eslint/no-unused-vars */
import { DQueues } from '../../../../common/Damba/core/Queues';
import { DefaultLLM, LlmProviderMap, MakeAiAgentProcessor, startWorkers } from '..';

/* ------------------------------ Example usage ----------------------------- */

type JobData = { conversationId: string; text: string };
type JobResult = { conversationId: string; answer: string };

const agent: MakeAiAgentProcessor<
  JobData,
  JobResult,
  string,
  LlmProviderMap[typeof DefaultLLM]
> = (config, llm) => {
  return async (job) => {
    const { conversationId, text } = job.data;

    // llm is typed as ChatOpenAI here
    // const res = await llm.invoke(text);

    return { conversationId, answer: `Réponse: ${text}` };
  };
};

startWorkers<JobData, JobResult, string, typeof DefaultLLM>(
  DQueues.UPDATE_ENTITIES,
  DefaultLLM,
  agent,
);
