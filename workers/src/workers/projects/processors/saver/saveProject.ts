/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForProject } from '@App/workers/LmmUtils';
import { getOrganisationById } from '@App/workers/organisation';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { DambaRepository } from '@Damba/v2/dao';
import { Project, BuildStatus } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { JobData } from '../../dtos';

export const saveProject = async (
  llm: any,
  prompt: string,
  dao: DambaRepository<DataSource>,
  payload: JobData,
): Promise<Project> => {
  const response = await callLLMForProject(llm, prompt);
  const organisation = await getOrganisationById(payload.tenantId, dao);
  const data: Partial<Project> = {
    name: response.name,
    description: response.description,
    initialPrompt: prompt,
    buildStatus: BuildStatus.INITIALIZING,
    created_at: new Date(),
    updated_at: new Date(),
    organization: organisation,
    created_by: payload.userId,
    version: 1,
    isForSale: false,
    price: 0,
    dambaVersion: 'v2',
    environments: [
      DambaEnvironmentType.DEV,
      DambaEnvironmentType.QA,
      DambaEnvironmentType.STAGING,
      DambaEnvironmentType.PROD,
    ],
    currentPlan: 'free',
  };
  return dao.DSave(Project, data) as Promise<Project>;
};
