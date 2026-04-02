/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from '@Damba/v2/service/DEvent';
import { CurrentSetting } from '@Damba/v2/Entity/UserDto';
import { NotFoundError, BadRequestError } from '@Damba/v2/errors';
import { DataModelEntity } from '@Database/entities/datamodeler/DataModelEntity';
import { DataModelColumn } from '@Database/entities/datamodeler/DataModelColumn';
import { DataModelRelationship } from '@Database/entities/datamodeler/DataModelRelationship';

export const RequireCurrentSetting = async (e: DEvent) => {
  const currentSetting = (await e.in.extras.users.getCurrentSetting(e)) as CurrentSetting;
  if (!currentSetting?.projId) throw new BadRequestError('No project selected');
  e.in.data = { ...e.in.data, currentSetting };
  e.go();
};

export const ResolvePackageEntities = async (e: DEvent) => {
  const { currentSetting } = e.in.data;
  const app = await e.in.extras['data-modeler'].getPackageEntities(e, currentSetting.projId);
  if (!app) throw new NotFoundError('package-entities application not found for this project');
  e.in.data = { ...e.in.data, packageApp: app };
  e.go();
};

export const ResolveEntity = async (e: DEvent) => {
  const entityId = e.in.params.entityId;
  if (!entityId) throw new BadRequestError('entityId is required');
  const entity = await e.in.DRepository.DGet(DataModelEntity, {
    where: { id: entityId },
  });
  if (!entity) throw new NotFoundError('Entity not found');
  e.in.data = { ...e.in.data, entity };
  e.go();
};

export const ResolveColumn = async (e: DEvent) => {
  const columnId = e.in.params.columnId;
  if (!columnId) throw new BadRequestError('columnId is required');
  const column = await e.in.DRepository.DGet(DataModelColumn, {
    where: { id: columnId },
  });
  if (!column) throw new NotFoundError('Column not found');
  e.in.data = { ...e.in.data, column };
  e.go();
};

export const ResolveRelationship = async (e: DEvent) => {
  const relationshipId = e.in.params.relationshipId;
  if (!relationshipId) throw new BadRequestError('relationshipId is required');
  const relationship = await e.in.DRepository.DGet(DataModelRelationship, {
    where: { id: relationshipId },
  });
  if (!relationship) throw new NotFoundError('Relationship not found');
  e.in.data = { ...e.in.data, relationship };
  e.go();
};
