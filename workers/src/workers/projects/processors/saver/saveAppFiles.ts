/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForAppFiles } from '@App/workers/LmmUtils';
import { DambaRepository } from '@Damba/v2/dao';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile } from './helpers';

export const saveFilesForApp = async (
  llm: any,
  app: Application,
  project: Project,
  modules: { name?: string }[],
  dao: DambaRepository<DataSource>,
): Promise<CodeFile[]> => {
  const { files } = await callLLMForAppFiles(
    llm,
    app.name!,
    app.type_app ?? 'api',
    app.description ?? '',
    project.description ?? '',
    project.initialPrompt ?? '',
    app.environment ?? 'DEV',
    modules.map((m) => m.name ?? '').filter(Boolean),
  );

  return Promise.all(
    files.map((f) => {
      const ext = f.name.includes('.') ? f.name.split('.').pop() : undefined;
      return saveCodeFile(dao, {
        name: f.name,
        path: f.path,
        fileExtension: ext,
        data: { content: f.content, fileType: f.fileType },
        stereotype: DStereotype.APPLICATION,
        applicationId: app.id,
        projectId: project.id,
        orgId: (project as any).organization?.id,
        projId: project.id,
        environment: app.environment,
        created_by: project.created_by,
      });
    }),
  );
};
