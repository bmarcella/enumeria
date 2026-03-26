/* eslint-disable @typescript-eslint/no-explicit-any */
// behaviors barrel

import { AppConfig } from '@App/config/app.config';
import { createService, DEvent } from '@App/damba.import';
import { ErrorMessage } from '@Common/error/error';
import { DataModelEntity } from '@Database/entities/datamodeler/DataModelEntity';
import { DataModelColumn } from '@Database/entities/datamodeler/DataModelColumn';
import { DataModelRelationship } from '@Database/entities/datamodeler/DataModelRelationship';

const auth = AppConfig?.authorization;
const api = createService('/data-modeler', DataModelEntity, undefined, [auth?.check(['user'])]);

// === ENTITIES ===

api.DPost(
  '/entities',
  async (e: DEvent) => {
    try {
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const entity = await e.in.DRepository.DSave(DataModelEntity, {
        ...body,
        created_by: userId,
      });
      return e.out.status(201).json(entity);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
  {
    getEntitiesByContext: async (e: DEvent, orgId: string, projId: string, servId?: string) => {
      const where: any = { orgId, projId };
      if (servId) where.servId = servId;
      return await e.in.DRepository.DGet(
        DataModelEntity,
        { where, relations: { columns: true }, order: { created_at: 'DESC' } },
        true,
      );
    },
    getEntityWithRelationships: async (e: DEvent, entityId: string) => {
      return await e.in.DRepository.DGet(DataModelEntity, {
        where: { id: entityId },
        relations: { columns: true, outgoingRelationships: true, incomingRelationships: true },
      });
    },
  },
);

api.DGet(
  '/entities',
  async (e: DEvent) => {
    try {
      const { orgId, projId, servId } = e.in.query;
      if (!orgId || !projId) return e.out.status(400).json({ error: 'orgId and projId are required' });
      const entities = await e.in.extras['data-modeler'].getEntitiesByContext(e, orgId, projId, servId);
      return e.out.json(entities);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DGet(
  '/entities/:entityId',
  async (e: DEvent) => {
    try {
      const { entityId } = e.in.params;
      const entity = await e.in.extras['data-modeler'].getEntityWithRelationships(e, entityId);
      if (!entity) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      return e.out.json(entity);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DPut(
  '/entities/:entityId',
  async (e: DEvent) => {
    try {
      const { entityId } = e.in.params;
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const existing = await e.in.DRepository.DGet(DataModelEntity, { where: { id: entityId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const updated = await e.in.DRepository.DSave(DataModelEntity, {
        ...(existing as any),
        ...body,
        id: entityId,
        updated_by: userId,
      });
      return e.out.json(updated);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DDelete(
  '/entities/:entityId',
  async (e: DEvent) => {
    try {
      const { entityId } = e.in.params;
      const existing = await e.in.DRepository.DGet(DataModelEntity, { where: { id: entityId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(DataModelEntity, { id: entityId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// === COLUMNS ===

api.DPost(
  '/entities/:entityId/columns',
  async (e: DEvent) => {
    try {
      const { entityId } = e.in.params;
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const entity = await e.in.DRepository.DGet(DataModelEntity, { where: { id: entityId } });
      if (!entity) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const column = await e.in.DRepository.DSave(DataModelColumn, {
        ...body,
        entityId,
        created_by: userId,
      });
      return e.out.status(201).json(column);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DGet(
  '/entities/:entityId/columns',
  async (e: DEvent) => {
    try {
      const { entityId } = e.in.params;
      const columns = await e.in.DRepository.DGet(
        DataModelColumn,
        { where: { entityId }, order: { ordinal: 'ASC' } },
        true,
      );
      return e.out.json(columns);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DPut(
  '/entities/:entityId/columns/:columnId',
  async (e: DEvent) => {
    try {
      const { columnId } = e.in.params;
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const existing = await e.in.DRepository.DGet(DataModelColumn, { where: { id: columnId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const updated = await e.in.DRepository.DSave(DataModelColumn, {
        ...(existing as any),
        ...body,
        id: columnId,
        updated_by: userId,
      });
      return e.out.json(updated);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DDelete(
  '/entities/:entityId/columns/:columnId',
  async (e: DEvent) => {
    try {
      const { columnId } = e.in.params;
      const existing = await e.in.DRepository.DGet(DataModelColumn, { where: { id: columnId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(DataModelColumn, { id: columnId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// === RELATIONSHIPS ===

api.DPost(
  '/relationships',
  async (e: DEvent) => {
    try {
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const fromEntity = await e.in.DRepository.DGet(DataModelEntity, { where: { id: body.fromEntityId } });
      if (!fromEntity) return e.out.status(404).json({ error: 'Source entity not found' });
      const toEntity = await e.in.DRepository.DGet(DataModelEntity, { where: { id: body.toEntityId } });
      if (!toEntity) return e.out.status(404).json({ error: 'Target entity not found' });
      const rel = await e.in.DRepository.DSave(DataModelRelationship, {
        ...body,
        created_by: userId,
      });
      return e.out.status(201).json(rel);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
  {
    getRelationshipsByProject: async (e: DEvent, orgId: string, projId: string) => {
      return await e.in.DRepository.DGet(
        DataModelRelationship,
        { where: { orgId, projId }, relations: { fromEntity: true, toEntity: true } },
        true,
      );
    },
  },
);

api.DGet(
  '/relationships',
  async (e: DEvent) => {
    try {
      const { orgId, projId } = e.in.query;
      if (!orgId || !projId) return e.out.status(400).json({ error: 'orgId and projId are required' });
      const rels = await e.in.extras['data-modeler'].getRelationshipsByProject(e, orgId, projId);
      return e.out.json(rels);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DDelete(
  '/relationships/:relationshipId',
  async (e: DEvent) => {
    try {
      const { relationshipId } = e.in.params;
      const existing = await e.in.DRepository.DGet(DataModelRelationship, { where: { id: relationshipId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(DataModelRelationship, { id: relationshipId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

export default api.done();
