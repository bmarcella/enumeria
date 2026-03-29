/* eslint-disable @typescript-eslint/no-explicit-any */
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { StepJobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import { saveFilesForApp, updateProjectBuildStatus } from '../processors/saver';
import { BuildStatus } from '@Database/entities/Project';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';
import { loadFullProjectContext } from './helpers';
import { Application } from '@Database/entities/Application';

export const step8Processor: MakeAiAgentProcessor<
  StepJobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, _llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;
    const {
      project,
      dambaApps,
      apis,
      uis,
      workers,
      databasePkg,
      validatorsPkg,
      policiesPkg,
      modules,
    } = await loadFullProjectContext(data.projectId, dao!);

    const allApps = [
      ...apis,
      ...uis,
      ...(workers ?? []),
      databasePkg,
      validatorsPkg,
      policiesPkg,
    ].filter(Boolean) as Application[];

    const allFiles = await Promise.all(
      allApps.map((app) => {
        const mods = dambaApps.includes(app)
          ? modules.filter((m) => m.application?.id === app.id)
          : [];
        return saveFilesForApp(app, project, mods, dao!);
      }),
    );

    const totalFiles = allFiles.reduce((sum, f) => sum + f.length, 0);

    await updateProjectBuildStatus(
      data.projectId,
      BuildStatus.IN_PROGRESS,
      dao!,
      CreateProjectStep.APP_FILES_GENERATED,
    );

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.APP_FILES_GENERATED,
      pct: 100,
      message: `Generated ${totalFiles} app file(s) across ${allApps.length} apps`,
      data: { fileCount: totalFiles },
    });

    return {
      step: PipelineStep.APP_FILES,
      projectId: data.projectId,
      requestId,
      nextStep: PipelineStep.DAMBA_COMMON,
      data: { fileCount: totalFiles },
    };
  };
};
