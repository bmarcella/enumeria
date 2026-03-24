/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnrecoverableError } from "bullmq";
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from "@App/workers";
import { JobData, JobResult } from "../dtos";
import { DataSource } from "typeorm";
import { DambaRepository } from "@Damba/v2/dao";

import {
  callLLMForProject,
  callLLMForModules,
  callLLMForServices,
  callLLMForBehaviors,
} from "@App/workers/LmmUtils";
import { BuildStatus, Project } from "@Database/entities/Project";
import { Application } from "@Database/entities/Application";
import { Modules } from "@Database/entities/Modules";
import { AppServices } from "@Database/entities/AppServices";
import { Behavior } from "@Database/entities/Behaviors";
import { Policy } from "@Database/entities/Policy";
import { Middleware } from "@Database/entities/Middleware";
import { getOrganisationById } from "@App/workers/organisation";
import { DambaEnvironmentType, EnvironmentLabels } from "@Damba/v2/Entity/env";
import { Http } from "@Damba/v1/service/IServiceDamba";
import type { BehaviorItem, MiddlewareItem, PolicyItem } from "@App/workers/LmmUtils/HierarchySchemas";

// ─── Step 1: Save project ────────────────────────────────────────────────────
const saveProject = async (
  llm: any,
  prompt: string,
  dao: DambaRepository<DataSource>,
  payload: JobData
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
    environments: [
      DambaEnvironmentType.PROD,
      DambaEnvironmentType.STAGING,
      DambaEnvironmentType.DEV,
      DambaEnvironmentType.QA,
    ],
    currentPlan: "free",
  };
  return dao.DSave(Project, data) as Promise<Project>;
};

// ─── Step 2: Save applications ───────────────────────────────────────────────
// ─── Step 2: Save one application per environment ───────────────────────────

const saveApplications = async (
  project: Project,
  dao: DambaRepository<DataSource>
): Promise<Application[]> => {
  const environments = project.environments ?? [];
  return Promise.all(
    environments.map((env) =>
      dao.DSave(Application, {
        name: `${project.name} - ${EnvironmentLabels[env] ?? env}`,
        description: `${env} application for ${project.name}`,
        type_app: 'api',
        project: project,
        projId: project.id,
        orgId: (project as any).organization?.id,
        environment: env,
        version: 1,
        created_by: project.created_by,
      } as Partial<Application>) as Promise<Application>
    )
  );
};

// ─── Step 3: Save modules per application ────────────────────────────────────

const saveModulesForApp = async (
  llm: any,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>
): Promise<Modules[]> => {
  const env = app.environment;
  const { modules } = await callLLMForModules(
    llm,
    app.name!,
    app.type_app ?? "api",
    app.description ?? "",
    env ?? "PROD"
  );
  return Promise.all(
    modules.map((mod) =>
      dao.DSave(Modules, {
        name: mod.name,
        description: mod.description,
        application: app,
        projId: project.id,
        OrgId: (project as any).organization?.id,
        environment: env,
        created_by: project.created_by,
      } as Partial<Modules>) as Promise<Modules>
    )
  );
};

// ─── Step 4: Save services per module ────────────────────────────────────────

const saveServicesForModule = async (
  llm: any,
  mod: Modules,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>
): Promise<AppServices[]> => {
  const env = app.environment;
  const { services } = await callLLMForServices(llm, mod.name!, mod.description ?? "", env ?? "PROD");
  return Promise.all(
    services.map((svc) =>
      dao.DSave(AppServices, {
        name: svc.name,
        description: svc.description,
        defaultEntity: svc.defaultEntity,
        crudConfig: svc.crudConfig,
        module: mod,
        applicationId: app.id,
        projId: project.id,
        orgId: (project as any).organization?.id,
        environment: env,
        created_by: project.created_by,
      } as Partial<AppServices>) as Promise<AppServices>
    )
  );
};

// ─── Step 5: Save behaviors (+ validators + policies + middlewares) ───────────

const saveMiddleware = async (
  mw: MiddlewareItem,
  dao: DambaRepository<DataSource>,
  application: Application,
  meta: { orgId?: string; projId?: string; moduleId?: string; servId?: string; created_by?: string; environment?: DambaEnvironmentType }
): Promise<Middleware> => {
  return dao.DSave(Middleware, {
    name: mw.name,
    description: mw.description,
    application: application,
    ...meta,
  } as Partial<Middleware>) as Promise<Middleware>;
};

const savePolicy = async (
  pol: PolicyItem,
  middlewares: Middleware[],
  dao: DambaRepository<DataSource>,
  application: Application,
  meta: { orgId?: string; projId?: string; moduleId?: string; servId?: string; created_by?: string; environment?: DambaEnvironmentType }
): Promise<Policy> => {
  const savedPolicies = await dao.DSave(Policy, {
    name: pol.name,
    description: pol.description,
    middlewares,
    application: application,
    ...meta,
  } as Partial<Policy>) as Policy;
  return savedPolicies;
};

const saveBehaviorsForService = async (
  llm: any,
  svc: AppServices,
  mod: Modules,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>
): Promise<Behavior[]> => {
  const env = app.environment;
  const { behaviors } = await callLLMForBehaviors(
    llm,
    svc.name!,
    svc.description ?? "",
    (svc.crudConfig as Record<string, boolean>) ?? {},
    env ?? "PROD"
  );

  const meta = {
    orgId: (project as any).organization?.id,
    projId: project.id,
    moduleId: mod.id,
    servId: svc.id,
    created_by: project.created_by,
    environment: env,
  };

  return Promise.all(
    behaviors.map(async (beh: BehaviorItem) => {
      // Save policies + middlewares for this behavior
      const savedPolicies = await Promise.all(
        beh.policies.map(async (pol: PolicyItem) => {
          const savedMiddlewares = await Promise.all(
            pol.middlewares.map((mw: MiddlewareItem) => saveMiddleware(mw, dao, app, meta))
          );
          return savePolicy(pol, savedMiddlewares, dao, app, meta);
        })
      );

      return dao.DSave(Behavior, {
        name: beh.name,
        path: beh.path,
        method: beh.method as Http,
        description: beh.description,
        policies: savedPolicies,
        ...meta,
      } as Partial<Behavior>) as Promise<Behavior>;
    })
  );
};

// ─── Orchestration ────────────────────────────────────────────────────────────

const buildHierarchy = async (
  llm: any,
  project: Project,
  originalPrompt: string,
  dao: DambaRepository<DataSource>,
  job: any
): Promise<void> => {
  // Applications — one per environment
  const applications = await saveApplications(project, dao);
  await job.updateProgress({
    requestId: job.data.requestId,
    data: { applicationCount: applications.length },
    step: "Applications generated",
    pct: 25,
    message: `Generated ${applications.length} application(s)`,
  });

  // Modules per application
  let totalModules = 0;
  const allModules: Array<{ mod: Modules; app: Application }> = [];
  for (const app of applications) {
    const modules = await saveModulesForApp(llm, app, project, dao);
    totalModules += modules.length;
    modules.forEach((mod) => allModules.push({ mod, app }));
  }
  await job.updateProgress({
    requestId: job.data.requestId,
    data: { moduleCount: totalModules },
    step: "Modules generated",
    pct: 45,
    message: `Generated ${totalModules} module(s)`,
  });

  // Services per module
  let totalServices = 0;
  const allServices: Array<{ svc: AppServices; mod: Modules; app: Application }> = [];
  for (const { mod, app } of allModules) {
    const services = await saveServicesForModule(llm, mod, app, project, dao);
    totalServices += services.length;
    services.forEach((svc) => allServices.push({ svc, mod, app }));
  }
  await job.updateProgress({
    requestId: job.data.requestId,
    data: { serviceCount: totalServices },
    step: "Services generated",
    pct: 65,
    message: `Generated ${totalServices} service(s)`,
  });

  // Behaviors + Policies + Validators per service
  let totalBehaviors = 0;
  for (const { svc, mod, app } of allServices) {
    const behaviors = await saveBehaviorsForService(llm, svc, mod, app, project, dao);
    totalBehaviors += behaviors.length;
  }
  await job.updateProgress({
    requestId: job.data.requestId,
    data: { behaviorCount: totalBehaviors },
    step: "Behaviors & Policies generated",
    pct: 90,
    message: `Generated ${totalBehaviors} behavior(s) with policies & validators`,
  });
};

// ─── Exported processor ───────────────────────────────────────────────────────
export const createNewProject: MakeAiAgentProcessor<
  JobData,
  JobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    try {
      const data = job.data;

      // Step 1: Create the project
      const project = await saveProject(llm, data.prompt, dao!, data);
      await job.updateProgress({
        requestId: data.requestId,
        data: { project },
        step: "Project created",
        pct: 10,
        message: "Project created",
      });

      // Steps 2–5: Build full hierarchy with LLM
      await buildHierarchy(llm, project, data.prompt, dao!, job);

      // Done
      await job.updateProgress({
        requestId: data.requestId,
        data: { project },
        step: "Done",
        pct: 100,
        message: "Project hierarchy fully generated",
      });

      return project;
    } catch (err) {
      throw new UnrecoverableError((err as any)?.message ?? "Unrecoverable error");
    }
  };
};

export default createNewProject;