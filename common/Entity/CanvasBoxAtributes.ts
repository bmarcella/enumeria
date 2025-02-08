import { TypeAttbutesTypeOrm } from './TypeAttributesTypeOrm';


export interface CanvasBoxAtributes {
  id: string;
  name: string;
  type?: TypeAttbutesTypeOrm | string;
  value?: string;
  visibility: VisibilityTypeAttributes;
  isMapped: boolean;
  isArray?: boolean;
  isId?: boolean;
  isGenerateAuto?: boolean;
  relation?: {
    type: RelationshipType,
    targetEntity: string,
    targetEntityAttribute: string
    eager?: boolean,
    joinTable?: boolean,
    cascade?: boolean | [],
    joinColumn?: boolean,
    columnToJoin?: {
      name?: string
      referencedColumnName?: string,
    },
    inverseJoinColumn?: boolean,
    inverseColumnToJoin?: {
      name?: string
      referencedColumnName?: string,
    },
  }
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
