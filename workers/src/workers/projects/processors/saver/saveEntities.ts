/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLMForEntities } from '@App/workers/LmmUtils';
import { DambaRepository } from '@Damba/v2/dao';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { AppServices } from '@Database/entities/AppServices';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Entities } from '@Database/entities/CanvasBox';
import { Modules } from '@Database/entities/Modules';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile, baseMeta } from './helpers';

export const generateEntityFileContent = (ent: { name: string; fields: any[] }): string => {
  const columns = ent.fields
    .map(
      (f: any) =>
        `  @Column({ type: '${f.type}', nullable: ${!f.required} })\n  ${f.name}${f.required ? '!' : '?'}: ${f.type === 'jsonb' ? 'Record<string, unknown>' : f.type === 'number' ? 'number' : f.type === 'boolean' ? 'boolean' : f.type === 'Date' ? 'Date' : 'string'};`,
    )
    .join('\n\n');

  return `// ${ent.name} entity
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('${ent.name.toLowerCase()}')
export class ${ent.name} {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  ${columns}
}
`;
};

export const saveEntityCodeFile = async (
  ent: Entities,
  entData: { name: string; fields: any[] },
  mod: Modules,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<CodeFile> => {
  const content = generateEntityFileContent(entData);
  return saveCodeFile(dao, {
    name: `${entData.name}.ts`,
    path: `/src/modules/${mod.name}/entities`,
    fileExtension: 'ts',
    data: { content },
    stereotype: DStereotype.ENTITY,
    moduleId: mod.id,
    ...baseMeta(app, project),
  });
};

export const saveEntitiesForService = async (
  llm: any,
  svc: AppServices,
  mod: Modules,
  app: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<Entities[]> => {
  const { entities } = await callLLMForEntities(
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
    entities.map(async (ent) => {
      const saved = (await dao.DSave(Entities, {
        name: ent.name,
        description: ent.description,
        fields: ent.fields,
        module: mod,
        projId: project.id,
        orgId: (project as any).organization?.id,
        environment: app.environment,
        created_by: project.created_by,
      } as Partial<Entities>)) as Entities;

      await saveEntityCodeFile(saved, ent, mod, app, project, dao);
      return saved;
    }),
  );
};
