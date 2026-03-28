/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnrecoverableError } from 'bullmq';
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { JobData, JobResult } from '../dtos';
import { DataSource } from 'typeorm';
import { saveApplications, saveProject, updateProjectBuildStatus } from './saver';
import { BuildStatus } from '@Database/entities/Project';
import { CreateProjectStep } from '@Damba/core/CreateProjectStep';
import { buildProjectHierarchy } from './buildHierarchy';

// ─── Exported processor ───────────────────────────────────────────────────────
export const createNewProject: MakeAiAgentProcessor<
  JobData,
  JobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.newRequestId ?? data.requestId;
    let projectId: string | undefined;

    try {
      const project = await saveProject(llm, data.prompt, dao!, data);
      projectId = project.id!;
      await updateProjectBuildStatus(projectId, BuildStatus.IN_PROGRESS, dao!);

      await job.updateProgress({
        requestId,
        data: { project },
        step: CreateProjectStep.PROJECT_CREATED,
        pct: 10,
        message: 'Project created',
      });

      const monorepoApps = await saveApplications(llm, project, dao!);

      const appCount =
        monorepoApps.apis.length +
        monorepoApps.uis.length +
        (monorepoApps.databasePkg ? 1 : 0) +
        (monorepoApps.validatorsPkg ? 1 : 0);
        
      await job.updateProgress({
        requestId,
        data: { applications: monorepoApps },
        step: CreateProjectStep.APPLICATIONS_GENERATED,
        pct: 15,
        message: `Generated ${appCount} application(s)`,
      });

      await buildProjectHierarchy(llm, project, monorepoApps, dao!, job, requestId);

      await updateProjectBuildStatus(projectId, BuildStatus.COMPLETED, dao!);
      await job.updateProgress({
        requestId,
        data: { project },
        step: CreateProjectStep.DONE,
        pct: 100,
        message: 'Project hierarchy fully generated',
      });
      return project;
    } catch (err) {
      if (projectId) {
        await updateProjectBuildStatus(projectId, BuildStatus.FAILED, dao!).catch(() => {});
      }
      throw new UnrecoverableError((err as any)?.message ?? 'Unrecoverable error');
    }
  };
};

export default createNewProject;
