import { CanvasBoxAtributes } from "./CanvasBoxAtributes";
import { BaseEntity } from "./project";

export interface Object extends BaseEntity {

  // canvas layout
  x?: number;
  y?: number;
  width?: number;
  height?: number;

}

export interface CanvasBox extends Object {
  id: string;
  entityName: string;
  stereotype?: string;

  // ownership & lifecycle
  ownerId?: string;
  tags?: string[];
  status?: 'draft' | 'active' | 'deprecated';



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

  // security & validation
  classification?: 'public' | 'internal' | 'restricted' | 'confidential';
  rules?: Record<string, unknown>;

  // codegen hints
  orm?: 'typeorm' | 'prisma' | 'sequelize';
  generateApi?: boolean;
  generateCrud?: boolean;

  // inheritance / composition
  extendsId?: string;     // prefer id over object to avoid recursion
  mixins?: string[];

  // diagram
  visibility: VisibilityTypeClass;
  isAbstract?: boolean;
  isAuth?: boolean;
  color?: string;
  icon?: string;
  locked?: boolean;
  selected?: boolean;
  zIndex?: number;


  // fields
  attributes?: CanvasBoxAtributes[];

  // (legacy login props—consider removing if these are entities, not app creds)
  username?: string[];
  password?: string;
}

export enum VisibilityTypeClass {
  PUBLIC = "public",
  PRIVATE = "private",
  PROTECTED = "protected",
  IMPLEMENTATION = "implementation",
}
