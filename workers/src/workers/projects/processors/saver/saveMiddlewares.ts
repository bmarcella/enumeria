/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForMiddlewares, callLLMForPolicies } from '@App/workers/LmmUtils';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { DambaRepository } from '@Damba/v2/dao';
import { Application } from '@Database/entities/Application';
import { Middleware } from '@Database/entities/Middleware';
import { Policy } from '@Database/entities/Policy';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveMiddleware, savePolicy } from './helpers';

export const saveGlobalMiddlewaresForApp = async (
  llm: any,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<Middleware[]> => {
  const { middlewares } = await callLLMForMiddlewares(
    llm,
    app.name!,
    app.type_app ?? 'api',
    app.description ?? '',
    project.description ?? '',
    project.initialPrompt ?? '',
    DambaEnvironmentType.DEV,
  );
  return Promise.all(
    middlewares.map((mw) =>
      saveMiddleware(mw, dao, app, {
        orgId: (project as any).organization?.id,
        projId: project.id,
        environment: undefined,
        created_by: project.created_by,
      }),
    ),
  );
};

export const saveGlobalPoliciesForApp = async (
  llm: any,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
  availableMiddlewares: Middleware[],
): Promise<Policy[]> => {
  const { policies } = await callLLMForPolicies(
    llm,
    app.name!,
    app.description ?? '',
    project.description ?? '',
    project.initialPrompt ?? '',
    availableMiddlewares.map((m) => m.name),
  );
  return Promise.all(
    policies.map((pol) => {
      const matchedMws = pol.middlewares
        .map((mwItem) => availableMiddlewares.find((m) => m.name === mwItem.name))
        .filter((m): m is Middleware => !!m);

      return savePolicy(pol, matchedMws, dao, app, {
        orgId: (project as any).organization?.id,
        projId: project.id,
        environment: undefined,
        created_by: project.created_by,
      });
    }),
  );
};
