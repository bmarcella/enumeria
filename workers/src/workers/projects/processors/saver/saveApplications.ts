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
  const [databasePkg, validatorsPkg, policiesPkg] = (await dao.DSaveMany(Application, [
    {
      ...base,
      name: `${project.name} - Database`,
      description: `Database package for ${project.name}`,
      type_app: 'package-entities',
    },
    {
      ...base,
      name: `${project.name} - Validators`,
      description: `Validators package for ${project.name}`,
      type_app: 'package-validators',
    },
    {
      ...base,
      name: `${project.name} - Policies & Middlewares`,
      description: `Policies & Middlewares package for ${project.name}`,
      type_app: 'package-policies-middlewares',
    },
  ] as Partial<Application>[])) as Application[];

  let apis = llmApps.filter((app) => app.type_app === 'api' || app.type_app === 'microservice');
  let uis = llmApps.filter((app) => app.type_app === 'ui');
  const workers = llmApps.filter((app) => app.type_app === 'workers');

  // Ensure at least one API and one UI app exist
  if (apis.length === 0) {
    const [defaultApi] = (await dao.DSaveMany(Application, [{
      ...base,
      name: `${project.name} API`,
      description: `Main API for ${project.name}`,
      type_app: 'api',
    }] as Partial<Application>[])) as Application[];
    apis = [defaultApi];
  }

  if (uis.length === 0) {
    const [defaultUi] = (await dao.DSaveMany(Application, [{
      ...base,
      name: `${project.name} UI`,
      description: `Frontend for ${project.name}`,
      type_app: 'ui',
    }] as Partial<Application>[])) as Application[];
    uis = [defaultUi];
  }

  return {
    apis,
    uis,
    databasePkg,
    validatorsPkg,
    policiesPkg,
    ...(workers.length > 0 ? { workers } : {}),
  };
};
