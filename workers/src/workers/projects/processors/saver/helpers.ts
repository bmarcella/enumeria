/* eslint-disable @typescript-eslint/no-explicit-any */
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';

import { DambaRepository } from '@Damba/v2/dao';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Middleware } from '@Database/entities/Middleware';
import { Policy } from '@Database/entities/Policy';
import { Project, BuildStatus } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { MiddlewareItem, PolicyItem } from '@App/workers/LmmUtils/HierarchySchemas';

export const updateProjectBuildStatus = async (
  projectId: string,
  status: BuildStatus,
  dao: DambaRepository<DataSource>,
): Promise<void> => {
  await dao.DUpdate(Project, { id: projectId }, { buildStatus: status, updated_at: new Date() });
};

export const saveCodeFile = async (
  dao: DambaRepository<DataSource>,
  data: {
    name: string;
    path?: string;
    fileExtension?: string;
    data?: any;
    stereotype: DStereotype;
    applicationId?: string;
    projectId?: string;
    moduleId?: string;
    serviceId?: string;
    behaviorId?: string;
    orgId?: string;
    projId?: string;
    environment?: DambaEnvironmentType;
    created_by?: string;
  },
): Promise<CodeFile> => {
  return dao.DSave(CodeFile, data as Partial<CodeFile>) as Promise<CodeFile>;
};

export const baseMeta = (app: Application, project: Project, environment?: DambaEnvironmentType) => ({
  applicationId: app.id,
  projectId: project.id,
  orgId: (project as any).organization?.id,
  projId: project.id,
  environment,
  created_by: project.created_by,
});

export const saveMiddleware = async (
  mw: MiddlewareItem,
  dao: DambaRepository<DataSource>,
  application: Application,
  meta: {
    orgId?: string;
    projId?: string;
    moduleId?: string;
    servId?: string;
    created_by?: string;
    environment?: DambaEnvironmentType;
  },
): Promise<Middleware> => {
  return dao.DSave(Middleware, {
    name: mw.name,
    description: mw.description,
    application: application,
    ...meta,
  } as Partial<Middleware>) as Promise<Middleware>;
};

export const savePolicy = async (
  pol: PolicyItem,
  middlewares: Middleware[],
  dao: DambaRepository<DataSource>,
  application: Application,
  meta: {
    orgId?: string;
    projId?: string;
    moduleId?: string;
    servId?: string;
    created_by?: string;
    environment?: DambaEnvironmentType;
  },
): Promise<Policy> => {
  return (await dao.DSave(Policy, {
    name: pol.name,
    description: pol.description,
    middlewares,
    application: application,
    ...meta,
  } as Partial<Policy>)) as Policy;
};
