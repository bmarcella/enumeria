/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from '@Damba/v2/service/DEvent';
import { Extras, DambaApi, DExtrasHandler } from '@Damba/v2/service/DambaService';
import { DataModelEntity } from '@Database/entities/datamodeler/DataModelEntity';
import { DataModelRelationship } from '@Database/entities/datamodeler/DataModelRelationship';
import { Application } from '@Database/entities/Application';

export const DataModelerExtras: Extras = (api?: DambaApi): DExtrasHandler => {
  return {
    getPackageEntities: async (e: DEvent, projectId: string) => {
      console.log('getPackageEntities', projectId);
      const apps = await e.in.DRepository.DGet(
        Application,
        {
          where: {
            project: { id: projectId },
            type_app: 'package-entities',
          },
        },
        true,
      );
      return (apps as any[])?.[0] ?? null;
    },

    getEntitiesByProject: async (e: DEvent, projectId: string) => {
      const app = await e.in.extras['data-modeler'].getPackageEntities(e, projectId);
      if (!app) return [];
      return await e.in.DRepository.DGet(
        DataModelEntity,
        {
          where: { application: { id: app.id } },
          relations: { columns: true },
          order: { created_at: 'DESC' },
        },
        true,
      );
    },

    getEntityWithRelationships: async (e: DEvent, entityId: string) => {
      return await e.in.DRepository.DGet(DataModelEntity, {
        where: { id: entityId },
        relations: {
          columns: true,
          outgoingRelationships: true,
          incomingRelationships: true,
        },
      });
    },

    getRelationshipsByProject: async (e: DEvent, projectId: string) => {
      const app = await e.in.extras['data-modeler'].getPackageEntities(e, projectId);
      if (!app) return [];
      const entities = (await e.in.DRepository.DGet(
        DataModelEntity,
        { where: { application: { id: app.id } }, select: { id: true } },
        true,
      )) as DataModelEntity[];
      if (!entities.length) return [];
      const entityIds = entities.map((ent) => ent.id);
      const { In } = await import('typeorm');
      return await e.in.DRepository.DGet(
        DataModelRelationship,
        {
          where: { fromEntityId: In(entityIds) },
          relations: { fromEntity: true, toEntity: true },
        },
        true,
      );
    },
  };
};
