/* eslint-disable @typescript-eslint/no-explicit-any */
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { Step1JobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import { saveProject, saveApplications, updateProjectBuildStatus } from '../processors/saver';
import { BuildStatus } from '@Database/entities/Project';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';

export const step1Processor: MakeAiAgentProcessor<
  Step1JobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;

    // 1. Create project
    const project = await saveProject(llm, data.prompt, dao!, {
      userId: data.userId,
      tenantId: data.tenantId,
      prompt: data.prompt,
      requestId,
    } as any);

    const projectId = project.id!;
    await updateProjectBuildStatus(
      projectId,
      BuildStatus.IN_PROGRESS,
      dao!,
      CreateProjectStep.PROJECT_CREATED,
    );

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.PROJECT_CREATED,
      pct: 50,
      message: 'Project created',
      data: { project },
    });

    // 2. Create applications
    const monorepoApps = await saveApplications(llm, project, dao!);

    await updateProjectBuildStatus(
      projectId,
      BuildStatus.IN_PROGRESS,
      dao!,
      CreateProjectStep.APPLICATIONS_GENERATED,
    );

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.APPLICATIONS_GENERATED,
      pct: 100,
      message: `Generated ${monorepoApps.apis.length + monorepoApps.uis.length} application(s) + ${3} packages`,
      data: { applications: monorepoApps },
    });
    return {
      step: PipelineStep.PROJECT_AND_APPS,
      projectId,
      requestId,
      nextStep: PipelineStep.ENTITIES,
      data: {
        project,
        applications: monorepoApps,
      },
    };
  };
};
