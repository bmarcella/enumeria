/* eslint-disable @typescript-eslint/no-explicit-any */
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { StepJobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import { saveGlobalMiddlewaresForApp, updateProjectBuildStatus } from '../processors/saver';
import { BuildStatus } from '@Database/entities/Project';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';
import { loadProjectContext } from './helpers';

export const step6Processor: MakeAiAgentProcessor<
  StepJobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;
    const { project, dambaApps, policiesPkg } = await loadProjectContext(data.projectId, dao!);
    const policiesTargetApp = policiesPkg ?? dambaApps[0];

    const allMiddlewares: any[] = [];
    for (const app of dambaApps) {
      const middlewares = await saveGlobalMiddlewaresForApp(llm, app, project, dao!, policiesTargetApp);
      allMiddlewares.push(...middlewares);
    }

    await updateProjectBuildStatus(data.projectId, BuildStatus.IN_PROGRESS, dao!, CreateProjectStep.GLOBAL_MIDDLEWARES_GENERATED);

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.GLOBAL_MIDDLEWARES_GENERATED,
      pct: 100,
      message: `Generated ${allMiddlewares.length} middleware(s)`,
      data: { middlewares: allMiddlewares },
    });

    return {
      step: PipelineStep.MIDDLEWARES_POLICIES,
      projectId: data.projectId,
      requestId,
      nextStep: PipelineStep.BEHAVIORS_EXTRAS,
      data: { middlewares: allMiddlewares },
    };
  };
};
