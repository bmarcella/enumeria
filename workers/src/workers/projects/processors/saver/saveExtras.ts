/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForExtras } from '@App/workers/LmmUtils';
import { DambaRepository } from '@Damba/v2/dao';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { AppServices } from '@Database/entities/AppServices';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Extra } from '@Database/entities/Extra';
import { Modules } from '@Database/entities/Modules';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile, baseMeta } from './helpers';
import { Extra_Hook } from '@Database/entities/Extra/ExtraHook';

/**
 * Generates extras file following the Damba pattern:
 *
 * export const getQuery: ExtraHook = (api?: DambaApi) => { return () => api?.params().query; };
 * export const SERVICE_EXTRAS: Extras = (api?: DambaApi) => ({ getQuery: getQuery(api) });
 */
export const generateExtraFileContent = (
  serviceName: string,
  hooks: Array<{ name: string; description: string; type?: string }>,
): string => {
  const hookFns = hooks
    .map(
      (h) => `// ${h.description}
export const ${h.name}: ExtraHook = (api?: DambaApi) => {
  return () => {
    // TODO: implement ${h.description}
    return null;
  };
};`,
    )
    .join('\n\n');

  const hookEntries = hooks.map((h) => `    ${h.name}: ${h.name}(api),`).join('\n');

  return `import { DambaApi, DExtrasHandler, ExtraHook, Extras } from '@Damba/v2/service/DambaService';

${hookFns}

export const ${serviceName}Extras: Extras = (api?: DambaApi): DExtrasHandler => {
  return {
${hookEntries}
  };
};

export default ${serviceName}Extras;
`;
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

  const meta = {
    appId: app.id,
    projId: project.id,
    orgId: (project as any).organization?.id,
    moduleId: mod.id,
    environment: mod.environment,
    created_by: project.created_by,
  };

  return Promise.all(
    extras.map(async (ext) => {
      const savedExtra = (await dao.DSave(Extra, {
        name: ext.name,
        description: ext.description,
        isContextNeeded: ext.isContextNeeded,
        appService: svc,
        ...meta,
      } as Partial<Extra>)) as Extra;

      const hookData: Array<{ name: string; description: string; type?: string }> = [];

      if (ext.hooks && ext.hooks.length > 0) {
        await Promise.all(
          ext.hooks.map(async (hook) => {
            await dao.DSave(Extra_Hook, {
              name: hook.name,
              description: hook.description,
              inputs: hook.inputs,
              outputs: hook.outputs,
              type: hook.type,
              extra: savedExtra,
              ...meta,
            } as Partial<Extra_Hook>);
            hookData.push({ name: hook.name, description: hook.description, type: hook.type });
          }),
        );
      }

      // Generate code file
      if (hookData.length > 0) {
        const svcName = (svc.name ?? 'service').replace(/[^a-zA-Z0-9]/g, '');
        const content = generateExtraFileContent(svcName, hookData);
        await saveCodeFile(dao, {
          name: `${svcName}Extras.ts`,
          path: `/src/modules/${mod.name}/extras`,
          fileExtension: 'ts',
          data: { content },
          stereotype: DStereotype.EXTRA,
          moduleId: mod.id,
          serviceId: svc.id,
          ...baseMeta(app, project, mod.environment),
        });
      }

      return savedExtra;
    }),
  );
};
