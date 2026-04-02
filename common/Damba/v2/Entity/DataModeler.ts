import { DambaEnvironmentType } from "./env";

// ── Relationship type between entities ──

export type DataModelRelationType = "1:1" | "1:N" | "N:1" | "N:N";

export type DataModelReferentialAction =
  | "RESTRICT"
  | "CASCADE"
  | "SET NULL"
  | "NO ACTION";

export type DataModelEntityStatus = "active" | "archived";

// ── Column ──

export interface IDataModelColumn {
  id: string;
  entityId: string;
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isNotNull: boolean;
  isArray: boolean;
  defaultValue?: string | null;
  enumValues?: string[] | null;
  checkConstraint?: string | null;
  length?: number | null;
  precision?: number | null;
  scale?: number | null;
  comment?: string | null;
  ordinal: number;
}

// ── Relationship ──

export interface IDataModelRelationship {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: DataModelRelationType;
  name?: string | null;
  color?: string | null;
  fkColumnId?: string | null;
  onDelete: DataModelReferentialAction;
  onUpdate: DataModelReferentialAction;
  description?: string | null;
  orgId: string;
  projId: string;
}

// ── Entity ──

export interface IDataModelEntity {
  id: string;
  name: string;
  description?: string | null;
  isAbstract: boolean;
  parentEntityId?: string | null;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  color?: string | null;
  tableName?: string | null;
  status: DataModelEntityStatus;
  environment: DambaEnvironmentType;
  application?: any;
  columns: IDataModelColumn[];
  outgoingRelationships?: IDataModelRelationship[];
  incomingRelationships?: IDataModelRelationship[];
}

// ── DTOs for create/update ──

export type CreateDataModelEntityDto = Pick<
  IDataModelEntity,
  "name" | "isAbstract" | "environment"
> &
  Partial<
    Pick<
      IDataModelEntity,
      | "description"
      | "parentEntityId"
      | "positionX"
      | "positionY"
      | "width"
      | "height"
      | "color"
      | "tableName"
      | "status"
      | "application"
    >
  >;

export type UpdateDataModelEntityDto = Partial<
  Omit<
    IDataModelEntity,
    "id" | "columns" | "outgoingRelationships" | "incomingRelationships"
  >
>;

export type CreateDataModelColumnDto = Pick<
  IDataModelColumn,
  "name" | "dataType"
> &
  Partial<Omit<IDataModelColumn, "id" | "entityId" | "name" | "dataType">>;

export type UpdateDataModelColumnDto = Partial<
  Omit<IDataModelColumn, "id" | "entityId">
>;

export type CreateDataModelRelationshipDto = Pick<
  IDataModelRelationship,
  "fromEntityId" | "toEntityId" | "type" | "orgId" | "projId"
> &
  Partial<
    Pick<
      IDataModelRelationship,
      "name" | "color" | "fkColumnId" | "onDelete" | "onUpdate" | "description"
    >
  >;

export type UpdateDataModelRelationshipDto = Partial<
  Omit<IDataModelRelationship, "id" | "orgId" | "projId">
>;
