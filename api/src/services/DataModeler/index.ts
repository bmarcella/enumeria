import {
  BehaviorsChainLooper,
  DambaService,
  createDambaService,
} from '@Damba/v2/service/DambaService';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { DataModelEntity } from '@Database/entities/datamodeler/DataModelEntity';
import { DataModelerExtras } from './extras';
import {
  RequireCurrentSetting,
  ResolvePackageEntities,
  ResolveEntity,
  ResolveColumn,
  ResolveRelationship,
} from './middlewares';
import {
  getEntities,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  getRelationships,
  createRelationship,
  updateRelationship,
  deleteRelationship,
} from './behaviors';

import { auth } from '@App/damba.import';

const service = {
  name: '/data-modeler',
  entity: DataModelEntity,
  middlewares: [auth?.check(['user'])],
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  // ── ENTITIES ──
  '/entities': [
    {
      method: Http.GET,
      behavior: getEntities,
      extras: DataModelerExtras,
      middlewares: [RequireCurrentSetting],
      config: { description: 'List entities for the current project' },
    },
    {
      method: Http.POST,
      behavior: createEntity,
      extras: DataModelerExtras,
      middlewares: [RequireCurrentSetting, ResolvePackageEntities],
      config: { description: 'Create a new data model entity' },
    },
  ],
  '/entities/:entityId': [
    {
      method: Http.GET,
      behavior: getEntityById,
      extras: DataModelerExtras,
      config: { description: 'Get entity with columns and relationships' },
    },
    {
      method: Http.PUT,
      behavior: updateEntity,
      middlewares: [ResolveEntity],
      config: { description: 'Update a data model entity' },
    },
    {
      method: Http.DELETE,
      behavior: deleteEntity,
      middlewares: [ResolveEntity],
      config: { description: 'Delete a data model entity' },
    },
  ],

  // ── COLUMNS ──
  '/entities/:entityId/columns': [
    {
      method: Http.GET,
      behavior: getColumns,
      middlewares: [ResolveEntity],
      config: { description: 'List columns for an entity' },
    },
    {
      method: Http.POST,
      behavior: createColumn,
      middlewares: [ResolveEntity],
      config: { description: 'Add a column to an entity' },
    },
  ],
  '/entities/:entityId/columns/:columnId': [
    {
      method: Http.PUT,
      behavior: updateColumn,
      middlewares: [ResolveColumn],
      config: { description: 'Update a column' },
    },
    {
      method: Http.DELETE,
      behavior: deleteColumn,
      middlewares: [ResolveColumn],
      config: { description: 'Delete a column' },
    },
  ],

  // ── RELATIONSHIPS ──
  '/relationships': [
    {
      method: Http.GET,
      behavior: getRelationships,
      extras: DataModelerExtras,
      middlewares: [RequireCurrentSetting],
      config: { description: 'List relationships for the current project' },
    },
    {
      method: Http.POST,
      behavior: createRelationship,
      extras: DataModelerExtras,
      config: { description: 'Create a relationship between entities' },
    },
  ],
  '/relationships/:relationshipId': [
    {
      method: Http.PUT,
      behavior: updateRelationship,
      middlewares: [ResolveRelationship],
      config: { description: 'Update a relationship' },
    },
    {
      method: Http.DELETE,
      behavior: deleteRelationship,
      middlewares: [ResolveRelationship],
      config: { description: 'Delete a relationship' },
    },
  ],
};

export default createDambaService({ service, behaviors });
