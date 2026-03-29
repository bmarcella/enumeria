/* eslint-disable @typescript-eslint/no-explicit-any */
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { StepJobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import { saveServicesForModule, saveModuleIndexFile, updateProjectBuildStatus } from '../processors/saver';
import { BuildStatus } from '@Database/entities/Project';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';
import { loadFullProjectContext } from './helpers';

export const step4Processor: MakeAiAgentProcessor<
  StepJobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;
    const { project, dambaApps, modules } = await loadFullProjectContext(data.projectId, dao!);
    const allServices: any[] = [];

    for (const app of dambaApps) {
      const appModules = modules.filter((m) => m.application?.id === app.id);
      for (const mod of appModules) {
        const services = await saveServicesForModule(llm, mod, app, project, dao!);
        allServices.push(...services);
        await saveModuleIndexFile(mod, services, app, project, dao!);
      }
    }

    await updateProjectBuildStatus(data.projectId, BuildStatus.IN_PROGRESS, dao!, CreateProjectStep.SERVICES_GENERATED);

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.SERVICES_GENERATED,
      pct: 100,
      message: `Generated ${allServices.length} service(s)`,
      data: { services: allServices },
    });

    return {
      step: PipelineStep.SERVICES,
      projectId: data.projectId,
      requestId,
      nextStep: PipelineStep.VALIDATORS,
      data: { services: allServices },
    };
  };
};
