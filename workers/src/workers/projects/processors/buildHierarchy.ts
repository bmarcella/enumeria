/* eslint-disable @typescript-eslint/no-explicit-any */
import { DambaRepository } from '@Damba/v2/dao';
import { AppServices } from '@Database/entities/AppServices';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import {
  saveBehaviorsForService,
  saveModulesForApp,
  saveServicesForModule,
  saveGlobalMiddlewaresForApp,
  saveGlobalValidatorsForApp,
  saveEntitiesForService,
  saveExtrasForService,
  saveFilesForApp,
  saveModuleIndexFile,
} from './saver';
import { Modules } from '@Database/entities/Modules';
import { Application } from '@Database/entities/Application';

export const buildHierarchyForApi = async (
  llm: any,
  project: Project,
  app: Application,
  dao: DambaRepository<DataSource>,
  job: any,
  requestId?: string,
): Promise<void> => {
  // 1. Global middlewares (reusable building blocks: AuthGuard, Logger, etc.)
  const globalMiddlewares = await saveGlobalMiddlewaresForApp(llm, app, project, dao);

  await job.updateProgress({
    requestId,
    data: { middlewareCount: globalMiddlewares.length },
    step: 'Global middlewares generated',
    pct: 10,
    message: `Generated ${globalMiddlewares.length} middleware(s)`,
  });

  // 2. Modules
  const modules = await saveModulesForApp(llm, app, project, dao);

  await job.updateProgress({
    requestId,
    data: { modules: modules },
    step: 'Modules generated',
    pct: 20,
    message: `Generated ${modules.length} module(s)`,
  });

  // 3. App-level files (index.ts, tsconfig.json, package.json, Dockerfile, etc.)
  const files = await saveFilesForApp(llm, app, project, modules, dao);
  await job.updateProgress({
    requestId,
    data: { fileCount: files.length, files: files.map((f) => f.name) },
    step: 'App files generated',
    pct: 30,
    message: `Generated ${files.length} app file(s)`,
  });

  // 4. Services per Module + service CodeFiles + module index.ts
  let totalServices = 0;
  const allServices: Array<{ svc: AppServices; mod: Modules }> = [];
  for (const mod of modules) {
    const services = await saveServicesForModule(llm, mod, app, project, dao);
    totalServices += services.length;
    services.forEach((svc) => allServices.push({ svc, mod }));

    // Generate module index.ts with IServiceProvider containing its services
    await saveModuleIndexFile(mod, services, app, project, dao);
  }

  await job.updateProgress({
    requestId,
    data: { serviceCount: totalServices, services: allServices.map((e) => e.svc) },
    step: 'Services generated',
    pct: 40,
    message: `Generated ${totalServices} service(s)`,
  });

  // 5. Entities per Service + entity CodeFiles
  let totalEntities = 0;
  const allEntityNames: string[] = [];
  for (const { svc, mod } of allServices) {
    const entities = await saveEntitiesForService(llm, svc, mod, app, project, dao);
    totalEntities += entities.length;
    entities.forEach((e) => { if (e.entityName) allEntityNames.push(e.entityName); });
  }

  await job.updateProgress({
    requestId,
    data: { entityCount: totalEntities },
    step: 'Entities generated',
    pct: 55,
    message: `Generated ${totalEntities} domain entities`,
  });

  // 6. Global Validators (reusable Zod schemas, informed by entities)
  const globalValidators = await saveGlobalValidatorsForApp(llm, app, project, dao, allEntityNames);

  await job.updateProgress({
    requestId,
    data: { validatorCount: globalValidators.length },
    step: 'Global validators generated',
    pct: 65,
    message: `Generated ${globalValidators.length} validator(s)`,
  });

  // 7. Extras + Behaviors per service (reuses global middlewares & validators)
  let totalBehaviors = 0;
  let totalExtras = 0;
  for (const { svc, mod } of allServices) {
    const extras = await saveExtrasForService(llm, svc, mod, app, project, dao);
    totalExtras += extras.length;
    const behaviors = await saveBehaviorsForService(
      llm,
      svc,
      mod,
      app,
      project,
      dao,
      globalMiddlewares,
      globalValidators,
    );
    totalBehaviors += behaviors.length;
  }

  await job.updateProgress({
    requestId,
    data: { behaviorCount: totalBehaviors, extraCount: totalExtras },
    step: 'Behaviors & Extras generated',
    pct: 95,
    message: `Generated ${totalBehaviors} behavior(s) and ${totalExtras} extra(s)`,
  });
};
