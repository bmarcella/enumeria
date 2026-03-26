/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForExtras } from '@App/workers/LmmUtils';
import { DambaRepository } from '@Damba/v2/dao';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { AppServices } from '@Database/entities/AppServices';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Extra, Extra_Hook } from '@Database/entities/Extra';
import { Modules } from '@Database/entities/Modules';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile, baseMeta } from './helpers';

export const generateExtraFileContent = (ext: {
  name: string;
  description: string;
  hooks?: any[];
}): string => {
  const hookExports = (ext.hooks ?? [])
    .map((h: any) => `export const ${h.name} = async (ctx: any) => {\n  // ${h.description}\n};`)
    .join('\n\n');

  return `// ${ext.name} extra
// ${ext.description}

${hookExports}
`;
};

export const saveExtraCodeFile = async (
  ext: Extra,
  extData: { name: string; description: string; hooks?: any[] },
  mod: Modules,
  svc: AppServices,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<CodeFile> => {
  const content = generateExtraFileContent(extData);
  return saveCodeFile(dao, {
    name: `${extData.name}.ts`,
    path: `/src/modules/${mod.name}/extras`,
    fileExtension: 'ts',
    data: { content },
    stereotype: DStereotype.EXTRA,
    moduleId: mod.id,
    serviceId: svc.id,
    ...baseMeta(app, project),
  });
};

export const saveExtrasForService = async (
  llm: any,
  svc: AppServices,
  mod: Modules,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<Extra[]> => {
  const { extras } = await callLLMForExtras(
    llm,
    app.name!,
    app.description ?? '',
    project.description ?? '',
    project.initialPrompt ?? '',
    mod.name!,
    mod.description ?? '',
    svc.name!,
    svc.description ?? '',
  );

  return Promise.all(
    extras.map(async (ext) => {
      const savedExtra = await (dao.DSave(Extra, {
        name: ext.name,
        description: ext.description,
        isContextNeeded: ext.isContextNeeded,
        appService: svc,
        projId: project.id,
        orgId: (project as any).organization?.id,
        environment: app.environment,
        created_by: project.created_by,
      } as Partial<Extra>) as Promise<Extra>);

      if (ext.hooks && ext.hooks.length > 0) {
        await Promise.all(
          ext.hooks.map((hook) =>
            dao.DSave(Extra_Hook, {
              name: hook.name,
              description: hook.description,
              inputs: hook.inputs,
              outputs: hook.outputs,
              type: hook.type,
              extra: savedExtra,
              projId: project.id,
              orgId: (project as any).organization?.id,
              environment: app.environment,
              created_by: project.created_by,
            } as Partial<Extra_Hook>),
          ),
        );
      }

      await saveExtraCodeFile(savedExtra, ext, mod, svc, app, project, dao);
      return savedExtra;
    }),
  );
};
