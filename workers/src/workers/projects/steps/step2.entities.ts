/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';
import { MakeAiAgentProcessor, LlmProviderMap, DefaultLLM } from '@App/workers';
import { StepJobData, StepJobResult } from '../stepDtos';
import { DataSource } from 'typeorm';
import { updateProjectBuildStatus } from '../processors/saver';
import { callLLMForEntities } from '@App/workers/LmmUtils';
import { BuildStatus } from '@Database/entities/Project';
import { PipelineStep, CreateProjectStep } from '@Damba/core/CreateProjectStep';
import { Entities } from '@Database/entities/CanvasBox';
import { loadProjectContext } from './helpers';

export const step2Processor: MakeAiAgentProcessor<
  StepJobData,
  StepJobResult,
  string,
  LlmProviderMap[typeof DefaultLLM],
  DataSource
> = (_config, llm, dao) => {
  return async (job) => {
    const data = job.data;
    const requestId = data.requestId;
    const { project, dambaApps, databasePkg } = await loadProjectContext(data.projectId, dao!);

    const entityTargetApp = databasePkg ?? dambaApps[0];

    // Check if entities already exist (handles retries)
    const existingEntities = (await dao!.DGet(
      Entities,
      { where: { projId: data.projectId } },
      true,
    )) as any[];

    if (existingEntities.length > 0) {
      await updateProjectBuildStatus(
        data.projectId,
        BuildStatus.IN_PROGRESS,
        dao!,
        CreateProjectStep.ENTITIES_GENERATED,
      );
      await job.updateProgress({
        requestId,
        step: CreateProjectStep.ENTITIES_GENERATED,
        pct: 100,
        message: `Found ${existingEntities.length} existing entities`,
        data: { entities: existingEntities },
      });
      return {
        step: PipelineStep.ENTITIES,
        projectId: data.projectId,
        requestId,
        nextStep: PipelineStep.MODULES,
        data: { entities: existingEntities },
      };
    }

    const allEntities: any[] = [];
    const seenNames = new Set<string>();

    for (const app of dambaApps) {
      const { entities } = await callLLMForEntities(
        llm,
        app.name!,
        app.description ?? '',
        project.description ?? '',
        project.initialPrompt ?? '',
        '', // no module yet
        '',
        '', // no service yet
        '',
      );

      for (const ent of entities) {
        // Skip duplicates (same entity name across apps)
        if (seenNames.has(ent.name)) continue;
        seenNames.add(ent.name);

        const saved = (await dao!.DSave(Entities, {
          entityName: ent.name,
          description: ent.description,
          stereotype: ent.stereotype,
          attributes: ent.attributes.map((a: any) => ({
            ...a,
            id: uuidv4(),
            isMapped: true,
          })),
          orgId: (project as any).organization?.id,
          projId: project.id,
          appId: entityTargetApp.id,
          created_by: project.created_by,
        } as any)) as Entities;

        allEntities.push({ ...saved, _raw: ent });
      }
    }

    await updateProjectBuildStatus(
      data.projectId,
      BuildStatus.IN_PROGRESS,
      dao!,
      CreateProjectStep.ENTITIES_GENERATED,
    );

    await job.updateProgress({
      requestId,
      step: CreateProjectStep.ENTITIES_GENERATED,
      pct: 100,
      message: `Generated ${allEntities.length} domain entities`,
      data: { entities: allEntities },
    });

    return {
      step: PipelineStep.ENTITIES,
      projectId: data.projectId,
      requestId,
      nextStep: PipelineStep.MODULES,
      data: { entities: allEntities },
    };
  };
};
