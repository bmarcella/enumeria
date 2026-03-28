/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForModules } from '@App/workers/LmmUtils';
import { DambaRepository } from '@Damba/v2/dao';import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { AppServices } from '@Database/entities/AppServices';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Modules } from '@Database/entities/Modules';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile } from './helpers';

export const saveModulesForApp = async (
  llm: any,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<Modules[]> => {
  const environments: DambaEnvironmentType[] = (project as any).environments ?? [DambaEnvironmentType.DEV];

  const { modules } = await callLLMForModules(
    llm,
    app.name!,
    app.type_app ?? 'api',
    app.description ?? '',
    project.description ?? '',
    project.initialPrompt ?? '',
  );

  return Promise.all(
    environments.flatMap((env) =>
      modules.map(
        (mod) =>
          dao.DSave(Modules, {
            name: mod.name,
            description: mod.description,
            codeFileContent: mod.codeFileContent,
            application: app,
            projId: project.id,
            orgId: (project as any).organization?.id,
            environment: env,
            created_by: project.created_by,
          } as Partial<Modules>) as Promise<Modules>,
      ),
    ),
  );
};

export const generateModuleIndexContent = (moduleName: string, serviceNames: string[]): string => {
  const imports = serviceNames
    .map((name) => `import ${name} from './services/${name}';`)
    .join('\n');

  const spreads = serviceNames.map((name) => `  ...${name},`).join('\n');

  return `// ${moduleName} module index
import { IServiceProvider } from '@Damba/v2/service/IServiceDamba';
import { Request, Response, NextFunction } from 'express';
${imports}

const _SPS_: IServiceProvider<Request, Response, NextFunction> = {
${spreads}
};

export default _SPS_;
`;
};

export const saveModuleIndexFile = async (
  mod: Modules,
  services: AppServices[],
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<CodeFile> => {
  const serviceNames = services.map((s) => s.name!).filter(Boolean);
  const content = generateModuleIndexContent(mod.name!, serviceNames);
  return saveCodeFile(dao, {
    name: 'index.ts',
    path: `/src/modules/${mod.name}`,
    fileExtension: 'ts',
    data: { content },
    stereotype: DStereotype.MODULE,
    applicationId: app.id,
    projectId: project.id,
    moduleId: mod.id,
    orgId: (project as any).organization?.id,
    projId: project.id,
    environment: mod.environment,
    created_by: project.created_by,
  });
};
