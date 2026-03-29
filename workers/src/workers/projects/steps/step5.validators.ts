/* eslint-disable @typescript-eslint/no-explicit-any */
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { StepJobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import { saveGlobalValidatorsForApp, updateProjectBuildStatus } from '../processors/saver';
import { BuildStatus } from '@Database/entities/Project';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';
import { loadFullProjectContext } from './helpers';

export const step5Processor: MakeAiAgentProcessor<
  StepJobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;
    const { project, dambaApps, validatorsPkg, entities } = await loadFullProjectContext(data.projectId, dao!);

    const validatorTargetApp = validatorsPkg ?? dambaApps[0];
    const contextApp = dambaApps[0]; // used for LLM context (app name/description)
    const entityNames = entities.map((e) => e.entityName).filter(Boolean) as string[];

    const globalValidators = await saveGlobalValidatorsForApp(
      llm,
      contextApp,
      validatorTargetApp,
      project,
      dao!,
      entityNames,
    );

    await updateProjectBuildStatus(data.projectId, BuildStatus.IN_PROGRESS, dao!, CreateProjectStep.GLOBAL_VALIDATORS_GENERATED);

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.GLOBAL_VALIDATORS_GENERATED,
      pct: 100,
      message: `Generated ${globalValidators.length} validator(s)`,
      data: { validators: globalValidators },
    });

    return {
      step: PipelineStep.VALIDATORS,
      projectId: data.projectId,
      requestId,
      nextStep: PipelineStep.MIDDLEWARES_POLICIES,
      data: { validators: globalValidators },
    };
  };
};
