/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';
import { callLLMForEntities } from '@App/workers/LmmUtils';
import { EntityAttributeItem, EntityItem } from '@App/workers/LmmUtils/HierarchySchemas';
import { DambaRepository } from '@Damba/v2/dao';
import { CanvasBoxAtributes, EntityStereotype, VisibilityTypeAttributes } from '@Damba/v2/Entity/CanvasBox';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { AppServices } from '@Database/entities/AppServices';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Entities } from '@Database/entities/CanvasBox';
import { Modules } from '@Database/entities/Modules';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile, baseMeta } from './helpers';

const TS_TYPE_MAP: Record<string, string> = {
  varchar: 'string',
  text: 'string',
  char: 'string',
  uuid: 'string',
  int: 'number',
  bigint: 'number',
  float: 'number',
  double: 'number',
  decimal: 'number',
  smallint: 'number',
  mediumint: 'number',
  boolean: 'boolean',
  timestamp: 'Date',
  date: 'Date',
  datetime: 'Date',
  jsonb: 'Record<string, unknown>',
  json: 'Record<string, unknown>',
};

const toTsType = (type: string, enumValues?: string[]): string => {
  if (type === 'enum' && enumValues?.length) {
    return enumValues.map((v) => `'${v}'`).join(' | ');
  }
  return TS_TYPE_MAP[type.toLowerCase()] ?? 'string';
};

const mapToCanvasAttributes = (attributes: EntityAttributeItem[]): CanvasBoxAtributes[] =>
  attributes.map((a) => ({
    id: uuidv4(),
    name: a.name,
    type: a.type,
    visibility: (a.visibility as VisibilityTypeAttributes) ?? VisibilityTypeAttributes.PUBLIC,
    isMapped: true,
    required: a.required,
    nullable: a.nullable,
    isId: a.isId,
    isGenerateAuto: a.isGenerateAuto,
    unique: a.unique,
    isArray: a.isArray,
    default: a.default != null ? String(a.default) : undefined,
    enumValues: a.enumValues,
    relation: a.relation as any,
  }));

export const generateEntityFileContent = (ent: EntityItem): string => {
  const columns = ent.attributes
    .filter((a) => !a.isId)
    .map((a) => {
      const tsType = toTsType(a.type, a.enumValues ?? []);
      const opts: string[] = [`type: '${a.type}'`];
      if (a.nullable) opts.push('nullable: true');
      if (a.unique) opts.push('unique: true');
      if (a.enumValues?.length) opts.push(`enum: [${a.enumValues.map((v) => `'${v}'`).join(', ')}]`);
      if (a.default != null) opts.push(`default: ${JSON.stringify(a.default)}`);
      return `  @Column({ ${opts.join(', ')} })\n  ${a.name}${a.nullable ? '?' : '!'}: ${tsType};`;
    })
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
  entItem: EntityItem,
  mod: Modules,
  targetApp: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<CodeFile> => {
  const content = generateEntityFileContent(entItem);
  return saveCodeFile(dao, {
    name: `${entItem.name}.ts`,
    path: `/src/entities/${mod.name}`,
    fileExtension: 'ts',
    data: { content },
    stereotype: DStereotype.ENTITY,
    moduleId: mod.id,
    ...baseMeta(targetApp, project, mod.environment),
  });
};

export const saveEntitiesForService = async (
  llm: any,
  svc: AppServices,
  mod: Modules,
  contextApp: Application,
  targetApp: Application,
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<Entities[]> => {
  const { entities } = await callLLMForEntities(
    llm,
    contextApp.name!,
    contextApp.description ?? '',
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
        entityName: ent.name,
        description: ent.description,
        stereotype: (ent.stereotype as EntityStereotype) ?? EntityStereotype.ENTITY,
        attributes: mapToCanvasAttributes(ent.attributes),
        environment: mod.environment,
        orgId: (project as any).organization?.id,
        projId: project.id,
        appId: targetApp.id,
        moduleId: mod.id,
        servId: svc.id,
        created_by: project.created_by,
      } as Partial<Entities>)) as Entities;

      await saveEntityCodeFile(saved, ent, mod, targetApp, project, dao);
      return saved;
    }),
  );
};
