/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForApplications } from '@App/workers/LmmUtils';
import { DambaRepository } from '@Damba/v2/dao';
import { Application } from '@Database/entities/Application';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { MonorepoApps } from '../buildHierarchy';

export const saveApplications = async (
  llm: any,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<MonorepoApps> => {
  const base = {
    project,
    projId: project.id,
    orgId: (project as any).organization?.id,
    version: 1,
    created_by: project.created_by,
  };

  // Ask LLM to determine the deployable applications (APIs + UIs)
  const { applications } = await callLLMForApplications(
    llm,
    project.name!,
    project.description ?? '',
    project.initialPrompt ?? '',
  );

  // Save LLM-generated apps (APIs, UIs, workers, etc.)
  const llmApps = (await dao.DSaveMany(
    Application,
    applications.map((app) => ({
      ...base,
      name: app.name,
      description: app.description,
      type_app: app.type_app,
    })) as Partial<Application>[],
  )) as Application[];

  // Always create the two shared packages
  const [databasePkg, validatorsPkg] = (await dao.DSaveMany(Application, [
    { ...base, name: `${project.name} - Database`, description: `Database package for ${project.name}`, type_app: 'packages' },
    { ...base, name: `${project.name} - Validators`, description: `Validators package for ${project.name}`, type_app: 'packages' },
  ] as Partial<Application>[])) as Application[];

  const apis = llmApps.filter((app) => app.type_app === 'api');
  const uis = llmApps.filter((app) => app.type_app === 'ui');
  const workers = llmApps.filter((app) => app.type_app === 'workers');

  return {
    apis,
    uis,
    databasePkg,
    validatorsPkg,
    ...(workers.length > 0 ? { workers } : {}),
  };
};
