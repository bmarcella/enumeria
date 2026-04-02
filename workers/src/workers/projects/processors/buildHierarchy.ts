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
  policiesPkg?: Application;
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
  const { apis, uis, databasePkg, validatorsPkg, policiesPkg, workers } = apps;

  const entityTargetApp = databasePkg ?? apis[0];
  const validatorTargetApp = validatorsPkg ?? apis[0];
  const policiesTargetApp = policiesPkg ?? apis[0];

  // Only API + microservice apps get the Damba hierarchy (modules → services → behaviors)
  const dambaAppTypes = ['api', 'microservice'];
  const hierarchyApps = apis.filter((a) => dambaAppTypes.includes(a.type_app ?? ''));

  // Collect cross-API aggregates
  let totalServices = 0;
  let totalEntities = 0;
  let totalBehaviors = 0;
  let totalExtras = 0;
  const allEntityNames: string[] = [];
  const allGlobalMiddlewares: any[] = [];
  const allModules: Modules[] = [];
  const allServices: Array<{ svc: AppServices; mod: Modules; api: Application }> = [];

  // ── 1. Global middlewares (15%) → saved to policies package ─────────────────
  for (const api of hierarchyApps) {
    const globalMiddlewares = await saveGlobalMiddlewaresForApp(
      llm,
      api,
      project,
      dao,
      policiesTargetApp,
    );
    allGlobalMiddlewares.push(...globalMiddlewares);
  }

  await job.updateProgress({
    requestId,
    data: { middlewareCount: allGlobalMiddlewares.length },
    step: CreateProjectStep.GLOBAL_MIDDLEWARES_GENERATED,
    pct: 15,
    message: `Generated ${allGlobalMiddlewares.length} middleware(s) across ${hierarchyApps.length} app(s)`,
  });

  // ── 2. Modules (25%) ──────────────────────────────────────────────────────
  for (const api of hierarchyApps) {
    const modules = await saveModulesForApp(llm, api, project, dao);
    allModules.push(...modules);
  }

  await job.updateProgress({
    requestId,
    data: { modules: allModules },
    step: CreateProjectStep.MODULES_GENERATED,
    pct: 25,
    message: `Generated ${allModules.length} module(s)`,
  });

  // ── 3. Services per Module + module index (40%) ───────────────────────────
  for (const api of hierarchyApps) {
    const appModules = allModules.filter((m) => m.application?.id === api.id);
    for (const mod of appModules) {
      const services = await saveServicesForModule(llm, mod, api, project, dao);
      totalServices += services.length;
      services.forEach((svc) => allServices.push({ svc, mod, api }));
      await saveModuleIndexFile(mod, services, api, project, dao);
    }
  }

  await job.updateProgress({
    requestId,
    data: { serviceCount: totalServices, services: allServices.map((e) => e.svc) },
    step: CreateProjectStep.SERVICES_GENERATED,
    pct: 40,
    message: `Generated ${totalServices} service(s)`,
  });

  // ── 4. Entities per Service → saved to shared Database package (55%) ──────
  for (const { svc, mod, api } of allServices) {
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

  await job.updateProgress({
    requestId,
    data: { entityCount: totalEntities },
    step: CreateProjectStep.ENTITIES_GENERATED,
    pct: 55,
    message: `Generated ${totalEntities} domain entities`,
  });

  // ── 5. App-level files for ALL apps (65%) ─────────────────────────────────
  const allApps = [...hierarchyApps, ...uis, databasePkg, validatorsPkg, policiesPkg].filter(
    Boolean,
  ) as Application[];

  const allFiles = await Promise.all(
    allApps.map((app) => {
      const mods = hierarchyApps.includes(app)
        ? allModules.filter((m) => m.application?.id === app.id)
        : [];
      return saveFilesForApp(app, project, mods, dao);
    }),
  );

  const totalFiles = allFiles.reduce((sum, f) => sum + f.length, 0);
  await job.updateProgress({
    requestId,
    data: { fileCount: totalFiles },
    step: CreateProjectStep.APP_FILES_GENERATED,
    pct: 65,
    message: `Generated ${totalFiles} app file(s) across ${allApps.length} apps`,
  });

  // ── 6. Global Validators → saved to shared Validators package (75%) ──────
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
    pct: 75,
    message: `Generated ${globalValidators.length} validator(s)`,
  });

  // ── 7. Extras + Behaviors per service (90%) ───────────────────────────────
  // Middlewares and policies created during behaviors are saved to the policies package
  for (const { svc, mod, api } of allServices) {
    const extras = await saveExtrasForService(llm, svc, mod, api, project, dao);
    totalExtras += extras.length;
    await saveBehaviorsForService(svc, mod, api, project, dao);
  }

  await job.updateProgress({
    requestId,
    data: { behaviorCount: totalBehaviors, extraCount: totalExtras },
    step: CreateProjectStep.BEHAVIORS_EXTRAS_GENERATED,
    pct: 90,
    message: `behavior(s) Generated  and ${totalExtras} extra(s)`,
  });

  // ── 8. Damba common files (95%) ───────────────────────────────────────────
  const dambaFiles = await saveDambaCommonFiles(project, dao);
  await job.updateProgress({
    requestId,
    data: { dambaFileCount: dambaFiles.length },
    step: CreateProjectStep.DAMBA_COMMON_FILES_LOADED,
    pct: 95,
    message: `Loaded ${dambaFiles.length} Damba framework file(s)`,
  });
};
