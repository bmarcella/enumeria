/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForValidators } from '@App/workers/LmmUtils';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { DambaRepository } from '@Damba/v2/dao';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile, baseMeta } from './helpers';
import { Validators } from '@Database/entities/Validators';

export const generateValidatorFileContent = (val: {
  name: string;
  description: string;
  schema: any;
}): string => {
  return `// ${val.name}
// ${val.description}
import { z } from 'zod';
export const ${val.name} = z.object(${JSON.stringify(val.schema?.properties ?? {}, null, 2)});
export type ${val.name.replace(/Schema$/, '')} = z.infer<typeof ${val.name}>;
`;
};

export const saveValidatorCodeFile = async (
  val: Validators,
  valData: { name: string; description: string; schema: any },
  targetApp: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<CodeFile> => {
  const content = generateValidatorFileContent(valData);
  return saveCodeFile(dao, {
    name: `${valData.name}.ts`,
    path: `/src/validators`,
    fileExtension: 'ts',
    data: { content },
    stereotype: DStereotype.VALIDATOR,
    ...baseMeta(targetApp, project),
  });
};

export const saveGlobalValidatorsForApp = async (
  llm: any,
  contextApp: Application,
  targetApp: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
  entityNames: string[],
): Promise<Validators[]> => {
  const { validators } = await callLLMForValidators(
    llm,
    contextApp.name!,
    contextApp.description ?? '',
    project.description ?? '',
    project.initialPrompt ?? '',
    ((project as any).environments?.[0] ?? DambaEnvironmentType.DEV),
    entityNames,
  );
  return Promise.all(
    validators.map(async (val) => {
      const saved = await (dao.DSave(Validators, {
        name: val.name,
        description: val.description,
        schema: val.schema,
        application: targetApp,
        projId: project.id,
        orgId: (project as any).organization?.id,
        environment: undefined,
        created_by: project.created_by,
      } as Partial<Validators>) as Promise<Validators>);

      await saveValidatorCodeFile(saved, val, targetApp, project, dao);
      return saved;
    }),
  );
};
