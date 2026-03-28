/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForBehaviors } from '@App/workers/LmmUtils';
import { MiddlewareItem, PolicyItem, BehaviorItem } from '@App/workers/LmmUtils/HierarchySchemas';
import { DambaRepository } from '@Damba/v2/dao';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { AppServices } from '@Database/entities/AppServices';
import { Application } from '@Database/entities/Application';
import { Behavior } from '@Database/entities/Behaviors';
import { BehaviorConfigValidator } from '@Database/entities/Behaviors/BehaviorValidatorConfig';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Middleware } from '@Database/entities/Middleware';
import { Modules } from '@Database/entities/Modules';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile, baseMeta, saveMiddleware, savePolicy } from './helpers';
import { Validators } from '@Database/entities/Validators';

export const generateBehaviorFileContent = (beh: {
  name: string;
  method: string;
  path: string;
  description: string;
}): string => {
  return `// ${beh.name} behavior
// ${beh.description}
// ${beh.method} ${beh.path}

import { Request, Response, NextFunction } from 'express';

export const ${beh.name} = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: implement ${beh.description}
};

export default ${beh.name};
`;
};

export const saveBehaviorCodeFile = async (
  beh: Behavior,
  behData: { name: string; method: string; path: string; description: string },
  mod: Modules,
  svc: AppServices,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<CodeFile> => {
  const content = generateBehaviorFileContent(behData);
  return saveCodeFile(dao, {
    name: `${behData.name}.ts`,
    path: `/src/modules/${mod.name}/behaviors`,
    fileExtension: 'ts',
    data: { content },
    stereotype: DStereotype.BEHAVIOR,
    moduleId: mod.id,
    serviceId: svc.id,
    behaviorId: beh.id,
    ...baseMeta(app, project, mod.environment),
  });
};

export const saveBehaviorsForService = async (
  llm: any,
  svc: AppServices,
  mod: Modules,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
  globalMiddlewares: Middleware[] = [],
  globalValidators: Validators[] = [],
): Promise<Behavior[]> => {
  const env = mod.environment;
  const { behaviors } = await callLLMForBehaviors(
    llm,
    app.name!,
    app.description ?? '',
    project.description ?? '',
    project.initialPrompt ?? '',
    mod.name!,
    mod.description ?? '',
    svc.name!,
    svc.description ?? '',
    (svc.crudConfig as Record<string, boolean>) ?? {},
    env ?? DambaEnvironmentType.PROD,
  );

  const meta = {
    orgId: (project as any).organization?.id,
    projId: project.id,
    moduleId: mod.id,
    servId: svc.id,
    created_by: project.created_by,
    environment: env,
  };

  const resolveValidator = async (name: string, schema: any): Promise<Validators | undefined> => {
    if (!schema || Object.keys(schema).length === 0) return undefined;
    const existing = globalValidators.find((v) => v.name === name);
    if (existing) return existing;
    return dao.DSave(Validators, {
      name,
      description: `Validator for ${name}`,
      schema,
      application: app,
      ...meta,
    } as Partial<Validators>) as Promise<Validators>;
  };

  return Promise.all(
    behaviors.map(async (beh: BehaviorItem) => {
      // 1. Policies + middlewares
      const savedPolicies = await Promise.all(
        beh.policies.map(async (pol: PolicyItem) => {
          const savedMiddlewares = await Promise.all(
            pol.middlewares.map((mw: MiddlewareItem) => {
              const existing = globalMiddlewares.find((g) => g.name === mw.name);
              return existing ? Promise.resolve(existing) : saveMiddleware(mw, dao, app, meta);
            }),
          );
          return savePolicy(pol, savedMiddlewares, dao, app, meta);
        }),
      );

      // 2. Config validators (reuse global where possible)
      const body = await resolveValidator(
        (beh.config?.body?.name as string) ?? 'body',
        beh.config?.body,
      );
      const query = await resolveValidator(
        (beh.config?.query?.name as string) ?? 'query',
        beh.config?.query,
      );
      const params = await resolveValidator(
        (beh.config?.params?.name as string) ?? 'params',
        beh.config?.params,
      );
      const response = await resolveValidator(
        (beh.config?.response?.name as string) ?? 'response',
        beh.config?.response,
      );

      const savedConfig = (await dao.DSave(BehaviorConfigValidator, {
        body,
        query,
        params,
        response,
        ...meta,
      } as Partial<BehaviorConfigValidator>)) as BehaviorConfigValidator;

      // 3. Save behavior
      const savedBehavior = (await dao.DSave(Behavior, {
        name: beh.name,
        path: beh.path,
        method: beh.method as Http,
        description: beh.description,
        policies: savedPolicies,
        config: savedConfig,
        ...meta,
      } as Partial<Behavior>)) as Behavior;

      // 4. CodeFile
      await saveBehaviorCodeFile(savedBehavior, beh, mod, svc, app, project, dao);

      return savedBehavior;
    }),
  );
};
