/* eslint-disable @typescript-eslint/no-explicit-any */
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { StepJobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import {
  saveModulesForApp,
  saveServicesForModule,
  saveModuleIndexFile,
  updateProjectBuildStatus,
} from '../processors/saver';
import { BuildStatus } from '@Database/entities/Project';
import { Modules } from '@Database/entities/Modules';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';
import { loadProjectContext } from './helpers';

export const step3Processor: MakeAiAgentProcessor<
  StepJobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;
    const { project, dambaApps } = await loadProjectContext(data.projectId, dao!);

    // ── Check if modules already exist (handles retries) ──────────────
    const existingModules = (await dao!.DGet(
      Modules,
      { where: { projId: data.projectId }, relations: { application: true } },
      true,
    )) as Modules[];

    let allModules: any[] = [];

    if (existingModules.length > 0) {
      allModules = existingModules;
    } else {
      // ── Generate modules ────────────────────────────────────────────
      const seenModuleNames = new Set<string>();
      for (const app of dambaApps) {
        const modules = await saveModulesForApp(llm, app, project, dao!);
        for (const mod of modules) {
          const key = `${app.id}:${mod.name}`;
          if (!seenModuleNames.has(key)) {
            seenModuleNames.add(key);
            allModules.push(mod);
          }
        }
      }
    }

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.MODULES_GENERATED,
      pct: 40,
      message: `Generated ${allModules.length} module(s), generating services...`,
      data: { modules: allModules },
    });

    // ── Generate services per module ──────────────────────────────────
    const allServices: any[] = [];

    for (const app of dambaApps) {
      const appModules = allModules.filter((m: any) => m.application?.id === app.id);
      for (const mod of appModules) {
        const services = await saveServicesForModule(llm, mod, app, project, dao!);
        allServices.push(...services);
        await saveModuleIndexFile(mod, services, app, project, dao!);
      }
    }

    await updateProjectBuildStatus(
      data.projectId,
      BuildStatus.IN_PROGRESS,
      dao!,
      CreateProjectStep.SERVICES_GENERATED,
    );

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.SERVICES_GENERATED,
      pct: 100,
      message: `Generated ${allModules.length} module(s) and ${allServices.length} service(s)`,
      data: { modules: allModules, services: allServices },
    });

    return {
      step: PipelineStep.MODULES,
      projectId: data.projectId,
      requestId,
      nextStep: PipelineStep.BEHAVIORS_EXTRAS,
      data: { modules: allModules, services: allServices },
    };
  };
};
