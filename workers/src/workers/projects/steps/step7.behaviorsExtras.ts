/* eslint-disable @typescript-eslint/no-explicit-any */
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { StepJobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import { saveBehaviorsForService, updateProjectBuildStatus } from '../processors/saver';
import { BuildStatus } from '@Database/entities/Project';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';
import { loadFullProjectContext } from './helpers';

export const step7Processor: MakeAiAgentProcessor<
  StepJobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, _llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;
    const ctx = await loadFullProjectContext(data.projectId, dao!);
    const { project, dambaApps, modules, services } = ctx;

    const allChains: any[] = [];

    for (const svc of services) {
      const mod = modules.find(
        (m) => m.id === (svc as any).module?.id || m.id === (svc as any).moduleId,
      );
      const app =
        dambaApps.find((a) => a.id === (svc as any).appId) ?? dambaApps[0];
      if (!mod) continue;

      const chain = await saveBehaviorsForService(svc, mod, app, project, dao!);
      allChains.push(chain);
    }

    await updateProjectBuildStatus(
      data.projectId,
      BuildStatus.IN_PROGRESS,
      dao!,
      CreateProjectStep.BEHAVIORS_EXTRAS_GENERATED,
    );

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.BEHAVIORS_EXTRAS_GENERATED,
      pct: 100,
      message: `Created ${allChains.length} behavior chain(s) with default CRUD`,
      data: { chains: allChains },
    });

    return {
      step: PipelineStep.BEHAVIORS_EXTRAS,
      projectId: data.projectId,
      requestId,
      nextStep: PipelineStep.APP_FILES,
      data: { chains: allChains },
    };
  };
};
