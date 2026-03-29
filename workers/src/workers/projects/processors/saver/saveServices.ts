/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForServices } from '@App/workers/LmmUtils';
import { DambaRepository } from '@Damba/v2/dao';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { AppServices } from '@Database/entities/AppServices';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Modules } from '@Database/entities/Modules';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile, baseMeta } from './helpers';

export const generateServiceFileContent = (svc: AppServices, mod: Modules): string => {
  return `// ${svc.name} service
import { createService } from '@Damba/v2/service';
import { ${svc.defaultEntity ?? svc.name} } from '../entities/${svc.defaultEntity ?? svc.name}';

const ${svc.name} = createService('/${mod.name?.toLowerCase()}/${svc.name?.toLowerCase()}', ${svc.defaultEntity ?? svc.name});

export default ${svc.name};
`;
};

export const saveServiceCodeFile = async (
  svc: AppServices,
  mod: Modules,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<CodeFile> => {
  const content = generateServiceFileContent(svc, mod);
  return saveCodeFile(dao, {
    name: `${svc.name}.ts`,
    path: `/src/modules/${mod.name}/services`,
    fileExtension: 'ts',
    data: { content },
    stereotype: DStereotype.SERVICE,
    moduleId: mod.id,
    serviceId: svc.id,
    ...baseMeta(app, project, mod.environment),
  });
};

export const saveServicesForModule = async (
  llm: any,
  mod: Modules,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<AppServices[]> => {
  const env = mod.environment;
  const { services } = await callLLMForServices(
    llm,
    app.name!,
    app.description ?? '',
    project.description ?? '',
    project.initialPrompt ?? '',
    mod.name!,
    mod.description ?? '',
    env ?? DambaEnvironmentType.DEV,
  );
  return Promise.all(
    services.map(async (svc) => {
      const saved = (await dao.DSave(AppServices, {
        name: svc.name,
        description: svc.description,
        defaultEntity: svc.defaultEntity,
        crudConfig: svc.crudConfig,
        module: mod,
        appId: app.id,
        projId: project.id,
        orgId: (project as any).organization?.id,
        environment: env,
        created_by: project.created_by,
      } as Partial<AppServices>)) as AppServices;

      await saveServiceCodeFile(saved, mod, app, project, dao);
      return saved;
    }),
  );
};
