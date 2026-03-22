
/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnrecoverableError } from "bullmq";
import { MakeAiAgentProcessor, LlmProviderMap, DefaultlLLM } from "@App/workers";
import { JobData, JobResult } from "../dtos";
import { DataSource } from "typeorm";
import { DambaRepository } from "@Damba/v2/dao";

import { callLLMForProject } from "@App/workers/LmmUtils";
import { BuildStatus, Project } from "@Database/entities/Project";
import { getOrganisationById } from "@App/workers/organisation";
import { DambaEnvironmentType } from "@Damba/v2/Entity/env";

const saveProject = async (llm : any, project: string, dao: DambaRepository<DataSource>) => {
 const response = await callLLMForProject(llm, project);
  const organisation = await getOrganisationById(response.organizationId, dao);
  const data = {
    name: response.name,
    description: response.description,
    initialPrompt: response.initialPrompt,
    buildStatus: BuildStatus.INITIALIZING,
    createdAt: new Date(),
    updatedAt: new Date(),
    organisation: organisation,
    version: 1,
    isForSale: false,
    price: 0,
    environments: [DambaEnvironmentType.PROD, DambaEnvironmentType.STAGING, DambaEnvironmentType.DEV, DambaEnvironmentType.QA],
    currentPlan: 'free',
  } as unknown as Project;
 return await dao.DSave(Project, data);

}

export const createNewProject: MakeAiAgentProcessor<
  JobData,
  JobResult,
  string,
  LlmProviderMap[typeof DefaultlLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    try {
      const data = job.data;
      const project = await saveProject(llm, data.prompt, dao!);
      await job.updateProgress({ requestId: data.requestId, step: 'Project created', pct: 100, message: 'Project created' });
      return project;
    } catch (err) {
      throw new UnrecoverableError((err as any)?.message ?? 'Unrecoverable error');
    }
  };
};

export default createNewProject;