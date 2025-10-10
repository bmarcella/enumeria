import { TypeAttbutesTypeOrm } from './TypeAttributesTypeOrm';


export interface CanvasBoxAtributes {
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
