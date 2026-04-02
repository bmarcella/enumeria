/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from '@Damba/v2/service/DEvent';
import { Behavior, DambaApi } from '@Damba/v2/service/DambaService';
import { NotFoundError } from '@Damba/v2/errors';
import { DataModelEntity } from '@Database/entities/datamodeler/DataModelEntity';
import { DataModelColumn } from '@Database/entities/datamodeler/DataModelColumn';
import { DataModelRelationship } from '@Database/entities/datamodeler/DataModelRelationship';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import {
  CreateDataModelEntityDto,
  CreateDataModelColumnDto,
  UpdateDataModelEntityDto,
  UpdateDataModelColumnDto,
  CreateDataModelRelationshipDto,
  UpdateDataModelRelationshipDto,
} from '@Damba/v2/Entity/DataModeler';

// ── ENTITIES ──

export const getEntities: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { currentSetting } = e.in.data;
    const entities = await e.in.extras['data-modeler'].getEntitiesByProject(
      e,
      currentSetting.projId,
    );
    return e.out.json(entities);
  };
};

export const getEntityById: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { entityId } = e.in.params;
    const entity = await e.in.extras['data-modeler'].getEntityWithRelationships(e, entityId);
    if (!entity) throw new NotFoundError('Entity not found');
    return e.out.json(entity);
  };
};

export const createEntity: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const body = e.in.body as CreateDataModelEntityDto;
    const { packageApp } = e.in.data;
    const userId = e.in.payload?.id;

    const entity = await e.in.DRepository.DSave(DataModelEntity, {
      name: body.name,
      isAbstract: body.isAbstract,
      description: body.description,
      parentEntityId: body.parentEntityId,
      positionX: body.positionX,
      positionY: body.positionY,
      width: body.width,
      height: body.height,
      color: body.color,
      tableName: body.tableName,
      status: body.status,
      application: packageApp,
      environment: body.environment ?? DambaEnvironmentType.DEV,
      created_by: userId,
      projId: packageApp.projId,
      orgId: packageApp.orgId,
    });
    return e.out.status(201).json(entity);
  };
};

export const updateEntity: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const body = e.in.body as UpdateDataModelEntityDto;
    const { entity } = e.in.data;
    const userId = e.in.payload?.id;

    const updated = await e.in.DRepository.DSave(DataModelEntity, {
      ...entity,
      name: body.name ?? entity.name,
      description: body.description !== undefined ? body.description : entity.description,
      isAbstract: body.isAbstract ?? entity.isAbstract,
      parentEntityId:
        body.parentEntityId !== undefined ? body.parentEntityId : entity.parentEntityId,
      positionX: body.positionX ?? entity.positionX,
      positionY: body.positionY ?? entity.positionY,
      width: body.width ?? entity.width,
      height: body.height ?? entity.height,
      color: body.color !== undefined ? body.color : entity.color,
      tableName: body.tableName !== undefined ? body.tableName : entity.tableName,
      status: body.status ?? entity.status,
      updated_by: userId,
    });
    return e.out.json(updated);
  };
};

export const deleteEntity: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { entity } = e.in.data;
    await e.in.DRepository.DDelete(DataModelEntity, { id: entity.id });
    return e.out.status(204).send();
  };
};

// ── COLUMNS ──

export const getColumns: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { entityId } = e.in.params;
    const columns = await e.in.DRepository.DGet(
      DataModelColumn,
      { where: { entityId }, order: { ordinal: 'ASC' } },
      true,
    );
    return e.out.json(columns);
  };
};

export const createColumn: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { entityId } = e.in.params;
    const body = e.in.body as CreateDataModelColumnDto;
    const userId = e.in.payload?.id;

    const column = await e.in.DRepository.DSave(DataModelColumn, {
      name: body.name,
      dataType: body.dataType,
      isPrimaryKey: body.isPrimaryKey,
      isForeignKey: body.isForeignKey,
      isUnique: body.isUnique,
      isNotNull: body.isNotNull,
      isArray: body.isArray,
      defaultValue: body.defaultValue,
      enumValues: body.enumValues,
      checkConstraint: body.checkConstraint,
      length: body.length,
      precision: body.precision,
      scale: body.scale,
      comment: body.comment,
      ordinal: body.ordinal,
      entityId,
      created_by: userId,
    });
    return e.out.status(201).json(column);
  };
};

export const updateColumn: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const body = e.in.body as UpdateDataModelColumnDto;
    const { column } = e.in.data;
    const userId = e.in.payload?.id;

    const updated = await e.in.DRepository.DSave(DataModelColumn, {
      ...column,
      name: body.name ?? column.name,
      dataType: body.dataType ?? column.dataType,
      isPrimaryKey: body.isPrimaryKey ?? column.isPrimaryKey,
      isForeignKey: body.isForeignKey ?? column.isForeignKey,
      isUnique: body.isUnique ?? column.isUnique,
      isNotNull: body.isNotNull ?? column.isNotNull,
      isArray: body.isArray ?? column.isArray,
      defaultValue: body.defaultValue !== undefined ? body.defaultValue : column.defaultValue,
      enumValues: body.enumValues !== undefined ? body.enumValues : column.enumValues,
      checkConstraint:
        body.checkConstraint !== undefined ? body.checkConstraint : column.checkConstraint,
      length: body.length !== undefined ? body.length : column.length,
      precision: body.precision !== undefined ? body.precision : column.precision,
      scale: body.scale !== undefined ? body.scale : column.scale,
      comment: body.comment !== undefined ? body.comment : column.comment,
      ordinal: body.ordinal ?? column.ordinal,
      updated_by: userId,
    });
    return e.out.json(updated);
  };
};

export const deleteColumn: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { column } = e.in.data;
    await e.in.DRepository.DDelete(DataModelColumn, { id: column.id });
    return e.out.status(204).send();
  };
};

// ── RELATIONSHIPS ──

export const getRelationships: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { currentSetting } = e.in.data;
    const rels = await e.in.extras['data-modeler'].getRelationshipsByProject(
      e,
      currentSetting.projId,
    );
    return e.out.json(rels);
  };
};

export const createRelationship: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const body = e.in.body as CreateDataModelRelationshipDto;
    const userId = e.in.payload?.id;

    const fromEntity = await e.in.DRepository.DGet(DataModelEntity, {
      where: { id: body.fromEntityId },
    });
    if (!fromEntity) throw new NotFoundError('Source entity not found');

    const toEntity = await e.in.DRepository.DGet(DataModelEntity, {
      where: { id: body.toEntityId },
    });
    if (!toEntity) throw new NotFoundError('Target entity not found');

    const rel = await e.in.DRepository.DSave(DataModelRelationship, {
      fromEntityId: body.fromEntityId,
      toEntityId: body.toEntityId,
      type: body.type,
      name: body.name,
      color: body.color,
      fkColumnId: body.fkColumnId,
      onDelete: body.onDelete ?? 'RESTRICT',
      onUpdate: body.onUpdate ?? 'RESTRICT',
      description: body.description,
      orgId: body.orgId,
      projId: body.projId,
      created_by: userId,
    });
    return e.out.status(201).json(rel);
  };
};

export const updateRelationship: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { relationship } = e.in.data;
    const body = e.in.body as UpdateDataModelRelationshipDto;
    const userId = e.in.payload?.id;

    const updated = await e.in.DRepository.DSave(DataModelRelationship, {
      ...relationship,
      type: body.type ?? relationship.type,
      name: body.name !== undefined ? body.name : relationship.name,
      color: body.color !== undefined ? body.color : relationship.color,
      fkColumnId: body.fkColumnId !== undefined ? body.fkColumnId : relationship.fkColumnId,
      onDelete: body.onDelete ?? relationship.onDelete,
      onUpdate: body.onUpdate ?? relationship.onUpdate,
      description: body.description !== undefined ? body.description : relationship.description,
      updated_by: userId,
    });
    return e.out.json(updated);
  };
};

export const deleteRelationship: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { relationship } = e.in.data;
    await e.in.DRepository.DDelete(DataModelRelationship, { id: relationship.id });
    return e.out.status(204).send();
  };
};
