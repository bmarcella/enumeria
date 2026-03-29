/* eslint-disable @typescript-eslint/no-explicit-any */
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { StepJobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import { saveDambaCommonFiles, updateProjectBuildStatus } from '../processors/saver';
import { BuildStatus, Project } from '@Database/entities/Project';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';

export const step9Processor: MakeAiAgentProcessor<
  StepJobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, _llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;

    const project = (await dao!.DGet(Project, { where: { id: data.projectId } })) as Project;
    if (!project) throw new Error(`Project ${data.projectId} not found`);

    const dambaFiles = await saveDambaCommonFiles(project, dao!);

    await updateProjectBuildStatus(
      data.projectId,
      BuildStatus.COMPLETED,
      dao!,
      CreateProjectStep.DONE,
    );

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.DAMBA_COMMON_FILES_LOADED,
      pct: 100,
      message: `Loaded ${dambaFiles.length} Damba framework file(s) — project complete`,
      data: { dambaFileCount: dambaFiles.length },
    });

    return {
      step: PipelineStep.DAMBA_COMMON,
      projectId: data.projectId,
      requestId,
      nextStep: undefined,
      data: { dambaFileCount: dambaFiles.length },
    };
  };
};
