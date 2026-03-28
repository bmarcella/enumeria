/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnrecoverableError } from 'bullmq';
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { DataSource, In } from 'typeorm';
import { DambaRepository } from '@Damba/v2/dao';
import { Application } from '@Database/entities/Application';
import { AppServices } from '@Database/entities/AppServices';
import { Behavior } from '@Database/entities/Behaviors';
import { BehaviorConfigValidator } from '@Database/entities/Behaviors/BehaviorValidatorConfig';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { AppFile } from '@Database/entities/AppFile';
import { Entities } from '@Database/entities/CanvasBox';
import { Extra } from '@Database/entities/Extra';
import { Middleware } from '@Database/entities/Middleware';
import { Modules } from '@Database/entities/Modules';
import { Policy } from '@Database/entities/Policy';
import { Project } from '@Database/entities/Project';
import { Validators } from '@Database/entities/Validators';
import { DeleteJobData, DeleteJobResult } from '../deleteDtos';

async function deleteProjectCascade(
  projectId: string,
  dao: DambaRepository<DataSource>,
  job: any,
  requestId?: string,
): Promise<void> {
  const progress = (step: string, pct: number) =>
    job.updateProgress({ requestId, step, pct, message: step });

  // 1. CodeFiles (stored with projectId directly)
  await dao.DDelete(CodeFile, { projectId });
  await progress('Code files deleted', 10);

  // 2. Clear many-to-many join tables before deleting parent rows
  //    behaviors_policies: behavior_id → policy_id
  //    policies_middlewares: policy_id → middleware_id
  await dao.DQuery(
    `DELETE FROM behaviors_policies WHERE behavior_id IN (
       SELECT id FROM behaviors WHERE "projId" = $1
     )`,
    [projectId],
  );
  await dao.DQuery(
    `DELETE FROM policies_middlewares WHERE policy_id IN (
       SELECT id FROM policies WHERE "projId" = $1
     )`,
    [projectId],
  );
  await progress('Relations cleared', 20);

  // 3. BehaviorConfigValidator then Behavior (Behavior has FK to config)
  await dao.DDelete(Behavior, { projId: projectId });
  await dao.DDelete(BehaviorConfigValidator, { projId: projectId });
  await progress('Behaviors deleted', 35);

  // 4. Extras & domain entities
  await dao.DDelete(Extra, { projId: projectId });
  await dao.DDelete(Entities, { projId: projectId });
  await progress('Extras & entities deleted', 50);

  // 5. AppServices — no projId column, delete via module IDs
  const modules = await dao.DGetAll(Modules, { where: { projId: projectId } });
  const moduleIds = modules.map((m) => m.id).filter(Boolean) as string[];
  if (moduleIds.length) {
    await dao.DDelete(AppServices, { module: { id: In(moduleIds) } as any });
  }
  await progress('Services deleted', 60);

  // 6. Validators, Middlewares, Policies (join table already cleared)
  await dao.DDelete(Validators, { projId: projectId });
  await dao.DDelete(Middleware, { projId: projectId });
  await dao.DDelete(Policy, { projId: projectId });
  await progress('Validators, middlewares & policies deleted', 70);

  // 7. Modules
  await dao.DDelete(Modules, { projId: projectId });
  await progress('Modules deleted', 75);

  // 8. AppFiles — stored with applicationId, get app IDs first
  const apps = await dao.DGetAll(Application, { where: { projId: projectId } });
  const appIds = apps.map((a) => a.id).filter(Boolean) as string[];
  if (appIds.length) {
    await dao.DDelete(AppFile, { application: { id: In(appIds) } as any });
  }

  // 9. Applications
  await dao.DDelete(Application, { projId: projectId });
  await progress('Applications deleted', 90);

  // 10. Project itself
  await dao.DDelete(Project, { id: projectId });
  await progress('Done', 100);
}

export const deleteProject: MakeAiAgentProcessor<
  DeleteJobData,
  DeleteJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, _llm, dao) => {
  return async (job) => {
    const { projectId, requestId } = job.data;

    if (!projectId) {
      throw new UnrecoverableError('deleteProject: missing projectId in job data');
    }

    try {
      await deleteProjectCascade(projectId, dao!, job, requestId);
      return { projectId, deleted: true };
    } catch (err) {
      throw new UnrecoverableError((err as any)?.message ?? 'Failed to delete project');
    }
  };
};

export default deleteProject;
