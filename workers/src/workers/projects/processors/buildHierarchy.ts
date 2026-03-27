/* eslint-disable @typescript-eslint/no-explicit-any */
import { DambaRepository } from '@Damba/v2/dao';
import { CreateProjectStep } from '@Damba/core/CreateProjectStep';
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
  saveDambaCommonFiles,
} from './saver';
import { Modules } from '@Database/entities/Modules';
import { Application } from '@Database/entities/Application';

export interface MonorepoApps {
  apis: Application[];
  uis: Application[];
  databasePkg?: Application;
  validatorsPkg?: Application;
  workers?: Application[];
}

export const buildProjectHierarchy = async (
  llm: any,
  project: Project,
  apps: MonorepoApps,
  dao: DambaRepository<DataSource>,
  job: any,
  requestId?: string,
): Promise<void> => {
  const { apis, uis, databasePkg, validatorsPkg } = apps;

  const entityTargetApp = databasePkg ?? apis[0];
  const validatorTargetApp = validatorsPkg ?? apis[0];

  // Collect cross-API aggregates
  let totalServices = 0;
  let totalEntities = 0;
  let totalBehaviors = 0;
  let totalExtras = 0;
  const allEntityNames: string[] = [];
  const allGlobalMiddlewares: any[] = [];
  const allModules: Modules[] = [];
  const allServices: Array<{ svc: AppServices; mod: Modules; api: Application }> = [];

  // ── Per-API hierarchy ──────────────────────────────────────────────────────
  for (const api of apis) {
    // 1. Global middlewares
    const globalMiddlewares = await saveGlobalMiddlewaresForApp(llm, api, project, dao);
    allGlobalMiddlewares.push(...globalMiddlewares);

    // 2. Modules
    const modules = await saveModulesForApp(llm, api, project, dao);
    allModules.push(...modules);

    // 3. Services per Module + module index.ts
    for (const mod of modules) {
      const services = await saveServicesForModule(llm, mod, api, project, dao);
      totalServices += services.length;
      services.forEach((svc) => allServices.push({ svc, mod, api }));
      await saveModuleIndexFile(mod, services, api, project, dao);
    }

    // 4. Entities per Service → saved to shared Database package
    for (const { svc, mod } of allServices.filter((s) => s.api === api)) {
      const entities = await saveEntitiesForService(
        llm,
        svc,
        mod,
        api,
        entityTargetApp,
        project,
        dao,
      );
      totalEntities += entities.length;
      entities.forEach((e) => {
        if (e.entityName) allEntityNames.push(e.entityName);
      });
    }
  }

  await job.updateProgress({
    requestId,
    data: { middlewareCount: allGlobalMiddlewares.length },
    step: CreateProjectStep.GLOBAL_MIDDLEWARES_GENERATED,
    pct: 15,
    message: `Generated ${allGlobalMiddlewares.length} middleware(s) across ${apis.length} API(s)`,
  });
  await job.updateProgress({
    requestId,
    data: { modules: allModules },
    step: CreateProjectStep.MODULES_GENERATED,
    pct: 25,
    message: `Generated ${allModules.length} module(s)`,
  });
  await job.updateProgress({
    requestId,
    data: { serviceCount: totalServices, services: allServices.map((e) => e.svc) },
    step: CreateProjectStep.SERVICES_GENERATED,
    pct: 40,
    message: `Generated ${totalServices} service(s)`,
  });
  await job.updateProgress({
    requestId,
    data: { entityCount: totalEntities },
    step: CreateProjectStep.ENTITIES_GENERATED,
    pct: 55,
    message: `Generated ${totalEntities} domain entities`,
  });

  // ── App-level files for ALL apps ───────────────────────────────────────────
  const allApps = [...apis, ...uis, databasePkg, validatorsPkg].filter(Boolean) as Application[];
  const allFiles = await Promise.all(
    allApps.map((app) => {
      const mods = apis.includes(app) ? allModules.filter((m) => m.application?.id === app.id) : [];
      return saveFilesForApp(llm, app, project, mods, dao);
    }),
  );
  const totalFiles = allFiles.reduce((sum, f) => sum + f.length, 0);
  await job.updateProgress({
    requestId,
    data: { fileCount: totalFiles },
    step: CreateProjectStep.APP_FILES_GENERATED,
    pct: 30,
    message: `Generated ${totalFiles} app file(s) across ${allApps.length} apps`,
  });

  // ── Global Validators → saved to shared Validators package ─────────────────
  const globalValidators = await saveGlobalValidatorsForApp(
    llm,
    apis[0],
    validatorTargetApp,
    project,
    dao,
    allEntityNames,
  );

  await job.updateProgress({
    requestId,
    data: { validatorCount: globalValidators.length },
    step: CreateProjectStep.GLOBAL_VALIDATORS_GENERATED,
    pct: 65,
    message: `Generated ${globalValidators.length} validator(s)`,
  });
  
  // ── Extras + Behaviors per service (per API) ───────────────────────────────
  for (const { svc, mod, api } of allServices) {
    const extras = await saveExtrasForService(llm, svc, mod, api, project, dao);
    totalExtras += extras.length;
    const behaviors = await saveBehaviorsForService(
      llm,
      svc,
      mod,
      api,
      project,
      dao,
      allGlobalMiddlewares,
      globalValidators,
    );
    totalBehaviors += behaviors.length;
  }
  await job.updateProgress({
    requestId,
    data: { behaviorCount: totalBehaviors, extraCount: totalExtras },
    step: CreateProjectStep.BEHAVIORS_EXTRAS_GENERATED,
    pct: 95,
    message: `Generated ${totalBehaviors} behavior(s) and ${totalExtras} extra(s)`,
  });

  // ── Damba common files → preloaded into common/Damba/v2 ──────────────────
  const dambaFiles = await saveDambaCommonFiles(project, dao);
  await job.updateProgress({
    requestId,
    data: { dambaFileCount: dambaFiles.length },
    step: CreateProjectStep.DAMBA_COMMON_FILES_LOADED,
    pct: 98,
    message: `Loaded ${dambaFiles.length} Damba framework file(s)`,
  });
};
