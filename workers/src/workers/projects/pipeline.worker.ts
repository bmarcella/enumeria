/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Pipeline worker — starts one BullMQ worker per pipeline step.
 * Each step listens on its own queue: `create_project:{step_name}_0`, `..._1`, etc.
 *
 * The old monolithic `create.worker.ts` ran all steps in one job.
 * This version runs each step as a separate job, triggered by the client
 * after validating the previous step's output.
 */
import { DefaultLLM, startWorkers } from '..';
import { pipelineQueue } from '../../../../common/Damba/core/Queues';
import { PipelineStep, PIPELINE_ORDER } from '../../../../common/Damba/core/CreateProjectStep';
import { StepJobData, Step1JobData, StepJobResult } from './stepDtos';
import { DataSource } from 'typeorm';
import {
  step1Processor,
  step2Processor,
  step3Processor,
  step4Processor,
  step5Processor,
  step6Processor,
  step7Processor,
  step8Processor,
  step9Processor,
} from './steps';

const processorMap: Record<PipelineStep, any> = {
  [PipelineStep.PROJECT_AND_APPS]: step1Processor,
  [PipelineStep.ENTITIES]: step2Processor,
  [PipelineStep.MODULES]: step3Processor,
  [PipelineStep.SERVICES]: step4Processor,
  [PipelineStep.VALIDATORS]: step5Processor,
  [PipelineStep.MIDDLEWARES_POLICIES]: step6Processor,
  [PipelineStep.BEHAVIORS_EXTRAS]: step7Processor,
  [PipelineStep.APP_FILES]: step8Processor,
  [PipelineStep.DAMBA_COMMON]: step9Processor,
};

(async () => {
  for (const step of PIPELINE_ORDER) {
    const queueName = pipelineQueue(step);
    const processor = processorMap[step];

    if (!processor) {
      console.warn(`[pipeline] No processor for step: ${step}`);
      continue;
    }

    await startWorkers<
      StepJobData | Step1JobData,
      StepJobResult,
      string,
      typeof DefaultLLM,
      DataSource
    >(queueName, DefaultLLM, processor, { concurrency: 1 });
    console.log(`[pipeline] Worker started for step: ${step} (queue: ${queueName})`);
  }
  console.log(`[pipeline] All ${PIPELINE_ORDER.length} step workers started`);
})();
