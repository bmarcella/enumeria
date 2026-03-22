
import { BaseEntity } from "./project";
import { TypeAttbutesTypeOrm } from './TypeAttributesTypeOrm';


export interface ICanvasBoxStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  borderRadius: number;
  backgroundColor : string;
}

export interface Object extends BaseEntity {
  // canvas layout
  x?: number;
  y?: number;
  width?: number;
  height?: number;

}

export interface CanvasBoxAtributes extends BaseEntity {
  id: string;
  name: string;

  // typing & mapping
  type?: TypeAttbutesTypeOrm | string;
  value?: string;
  visibility: VisibilityTypeAttributes;
  isMapped: boolean;
  isArray?: boolean;
  isId?: boolean;
  isGenerateAuto?: boolean;     // consider: rename to isGenerated?
  isParent?: boolean;
  
  // DB column options
  nullable?: boolean;
  unique?: boolean;
  default?: string | number | boolean;
  length?: number;
  precision?: number;
  scale?: number;
  enumValues?: string[];
  check?: string;
  comment?: string;
  indexed?: boolean;

  // validation / UX
  required?: boolean;          // UI-level required (separate from nullable)
  min?: number;
  max?: number;
  pattern?: string;
  label?: string;
  hint?: string;
  mask?: boolean;              // obfuscate in forms
  readOnly?: boolean;
  hidden?: boolean;

  // computed / virtual
  computed?: boolean;
  computeExpr?: string;

  // relations
  relation?: {
    type: RelationshipType;
    targetEntity: string;           // entity id or name
    targetEntityAttribute: string;  // attribute id or name
    eager?: boolean;
    joinTable?: boolean;
    cascade?: boolean | [];
    joinColumn?: boolean;
    columnToJoin?: {
      name?: string;
      referencedColumnName?: string;
    };
    inverseJoinColumn?: boolean;
    inverseColumnToJoin?: {
      name?: string;
      referencedColumnName?: string;
    };

    // ADD: cardinality & referential actions
    onDelete?: 'RESTRICT' | 'CASCADE' | 'SET NULL';
    onUpdate?: 'RESTRICT' | 'CASCADE' | 'SET NULL';
    orphanRemoval?: boolean;
    inverseSide?: string;   // mappedBy/inverse property
    through?: string;       // explicit join table name for M:N
    joinTableOptions?: {
      name?: string;
      joinColumn?: string;
      inverseJoinColumn?: string;
    };
  };

  // canvas layout for attribute nodes (if you render them)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}


export enum VisibilityTypeAttributes {
  PUBLIC = "public",
  PRIVATE = "private",
  PROTECTED = "protected",
  IMPLEMENTATION = "implementation",
}

export enum RelationshipType {
  ONE_TO_ONE = "@OneToOne",
  MANY_TO_ONE = "@ManyToOne",
  ONE_TO_MANY = "@OneToMany",
  MANY_TO_MANY = "@ManyToMany"
}

export const RelationshipTypeEnum = RelationshipType;

export type CanvasBoxStatus =  'active' | 'archived';
export type CanvasBoxORM =  'typeorm';

export enum CanvasBoxClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential',
}

export interface CanvasBoxMapConfig {
  
   // persistence & mapping
  tableName?: string;
  schema?: string;
  namespace?: string;
  pluralName?: string;
  slug?: string;
  softDelete?: boolean;      // enable @DeleteDateColumn
  versioned?: boolean;       // optimistic locking/version column
  uniqueConstraints?: string[][]; // [['email'], ['firstName','lastName']]
  indexes?: { name?: string; columns: string[]; unique?: boolean }[];
  orm?: CanvasBoxORM;
  generateApi?: boolean;
  generateCrud?: boolean;
}

export interface CanvasBoxDiagramConfig {
  visibility: VisibilityTypeClass;
  isAbstract?: boolean;
  isAuth?: boolean;
    // (legacy login props—consider removing if these are entities, not app creds)
  username?: string[];
  password?: string;
  color?: string;
  icon?: string;
  locked?: boolean;
  selected?: boolean;
  zIndex?: number;
}

export enum EntityStereotype {
  ENTITY = '<<entity>>',
  MODEL = '<<model>>',
  DTO = '<<dto>>',
  schema = '<<schema>>',
}


export interface CanvasBox extends Object {
  // ignore this field
  id: string;
  // dont ignore these fields
  entityName: string;
  stereotype?: EntityStereotype;
  description?: string;
  extendsId?: string;
  classification?: CanvasBoxClassification;
  // META

  // ignore these fields
  parentId?: string;

  // ignore these fields
  env?: string;
  orgId?: string;
  projId?: string;
  appId?: string;
  moduleId?: string;
  servId?: string;

  // dont ignore these fields
  attributes?: CanvasBoxAtributes[];


   // ignore these fields
  status?: CanvasBoxStatus ;
  mapConfig?: CanvasBoxMapConfig;
  diagramConfig?: CanvasBoxDiagramConfig;

  // security & validation

  rules?: Record<string, unknown>;
   // prefer id over object to avoid recursion
  mixins?: string[];


}

export enum VisibilityTypeClass {
  PUBLIC = "public",
  PRIVATE = "private",
  PROTECTED = "protected",
  IMPLEMENTATION = "implementation",
}


