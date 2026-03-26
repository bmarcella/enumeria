/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnrecoverableError } from "bullmq";
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from "@App/workers";
import { JobData, JobResult } from "../dtos";
import { DataSource } from "typeorm"
import { buildHierarchyForApi } from "./buildHierarchy";
import { saveApplications, saveProject, updateProjectBuildStatus } from "./saver";
import { DambaEnvironmentType } from "@Damba/v2/Entity/env";
import { BuildStatus } from "@Database/entities/Project";

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
      // Step 1: Create the project
      const project = await saveProject(llm, data.prompt, dao!, data);
      projectId = project.id;
      await updateProjectBuildStatus(projectId, BuildStatus.IN_PROGRESS, dao!);
      await job.updateProgress({
        requestId,
        data: { project },
        step: "Project created",
        pct: 10,
        message: "Project created",
      });

      // Applications — one per environment
      const applications = await saveApplications(project, dao!);
      await job.updateProgress({
        requestId,
        data: { applications: applications },
        step: "Applications generated",
        pct: 15,
        message: `Generated ${applications.length} application(s)`,
      });

      const devApp = applications.find((app) => app.environment === DambaEnvironmentType.DEV && app.type_app === 'api');

      if (devApp) {
        // Steps 2–5: Build full hierarchy with LLM
        await buildHierarchyForApi(llm, project, devApp, dao!, job, requestId);
      }

      // Done
      await updateProjectBuildStatus(projectId, BuildStatus.COMPLETED, dao!);
      await job.updateProgress({
        requestId,
        data: { project },
        step: "Done",
        pct: 100,
        message: "Project hierarchy fully generated",
      });
      return project;
    } catch (err) {
      if (projectId) {
        await updateProjectBuildStatus(projectId, BuildStatus.FAILED, dao!).catch(() => {});
      }
      throw new UnrecoverableError((err as any)?.message ?? "Unrecoverable error");
    }
  };
};

export default createNewProject;