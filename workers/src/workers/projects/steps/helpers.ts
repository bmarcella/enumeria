/* eslint-disable @typescript-eslint/no-explicit-any */
import { DambaRepository } from '@Damba/v2/dao';
import { Application } from '@Database/entities/Application';
import { Project } from '@Database/entities/Project';
import { Modules } from '@Database/entities/Modules';
import { AppServices } from '@Database/entities/AppServices';
import { Entities } from '@Database/entities/CanvasBox';
import { Middleware } from '@Database/entities/Middleware';
import { Validators } from '@Database/entities/Validators';
import { DataSource, In } from 'typeorm';

/** App types that follow the Damba hierarchy (modules → services → behaviors) */
const DAMBA_APP_TYPES = ['api', 'microservice'];

export const isDambaApp = (app: Application): boolean =>
  DAMBA_APP_TYPES.includes(app.type_app ?? '');

export interface ProjectContext {
  project: Project;
  /** API + microservice apps — these get the full Damba hierarchy */
  dambaApps: Application[];
  apis: Application[];
  uis: Application[];
  workers: Application[];
  databasePkg?: Application;
  validatorsPkg?: Application;
  policiesPkg?: Application;
}

export interface FullProjectContext extends ProjectContext {
  modules: Modules[];
  services: AppServices[];
  entities: Entities[];
  middlewares: Middleware[];
  validators: Validators[];
}

/**
 * Loads the project and its applications from the DB.
 * Used by step 2+ processors to get context from previous steps.
 */
export const loadProjectContext = async (
  projectId: string,
  dao: DambaRepository<DataSource>,
): Promise<ProjectContext> => {
  const project = (await dao.DGet(Project, {
    where: { id: projectId },
    relations: { organization: true },
  })) as Project;

  if (!project) throw new Error(`Project ${projectId} not found`);

  const allApps = (await dao.DGet(Application, { where: { projId: projectId } }, true)) as Application[];

  const apis = allApps.filter((a) => a.type_app === 'api');
  const uis = allApps.filter((a) => a.type_app === 'ui');
  const workers = allApps.filter((a) => a.type_app === 'workers');
  const dambaApps = allApps.filter(isDambaApp);
  const databasePkg = allApps.find((a) => a.type_app === 'package-entities');
  const validatorsPkg = allApps.find((a) => a.type_app === 'package-validators');
  const policiesPkg = allApps.find((a) => a.type_app === 'package-policies-middlewares');

  return { project, dambaApps, apis, uis, workers, databasePkg, validatorsPkg, policiesPkg };
};

/**
 * Loads everything built so far — modules, services, entities, middlewares, validators.
 * Used by later steps that depend on earlier outputs.
 */
export const loadFullProjectContext = async (
  projectId: string,
  dao: DambaRepository<DataSource>,
): Promise<FullProjectContext> => {
  const base = await loadProjectContext(projectId, dao);

  const modules = (await dao.DGet(Modules, { where: { projId: projectId }, relations: { application: true } }, true)) as Modules[];
  const services = (await dao.DGet(AppServices, { where: { projId: projectId }, relations: { module: true } }, true)) as AppServices[];
  const entities = (await dao.DGet(Entities, { where: { projId: projectId } }, true)) as Entities[];
  // Middleware extends AppBaseEntity (no projId) — query via application relation
  const allAppsList = [...base.apis, ...base.uis, ...base.workers, base.databasePkg, base.validatorsPkg, base.policiesPkg].filter(Boolean) as Application[];
  const appIds = allAppsList.map((a) => a.id).filter(Boolean);
  let middlewares: Middleware[] = [];
  if (appIds.length > 0) {
    middlewares = (await dao.DGet(Middleware, { where: { application: { id: In(appIds) } } }, true)) as Middleware[];
  }
  const validators = (await dao.DGet(Validators, { where: { projId: projectId } }, true)) as Validators[];

  return { ...base, modules, services, entities, middlewares, validators };
};
