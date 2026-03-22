
import { CanvasBox, VisibilityTypeAttributes } from './CanvasBox';

export type DtoIO = 'input' | 'output';

export type DtoPurpose = 'create' | 'update' | 'query' | 'response' | 'custom'

/** How to represent a relation in the DTO */
export type RelationStyle =
  | 'id'            // only the foreign key: string/uuid/number
  | 'embed'         // embed full target DTO (can be nested)
  | 'both'          // include id + embed
  | 'omit'          // skip relation (for input you may not need it)

/** Visibility filter to include attributes by their visibility */
export type VisibilityPolicy = {
  allow?: VisibilityTypeAttributes[]       // attr visibilities allowed
  deny?: VisibilityTypeAttributes[]        // attr visibilities denied (wins over allow)
}

export interface DtoFieldOverride {
  /** force type (TS), e.g. 'string', 'number', 'MyCustomType' */
  tsType?: string
  /** force required/optional */
  required?: boolean
  /** force array */
  isArray?: boolean
  /** custom description (for OpenAPI, docs) */
  description?: string
}

export type DtoOverrides = {
  /** include/exclude attributes by name */
  includeAttrs?: string[]
  excludeAttrs?: string[]
  /** per-attribute overrides */
  field?: Record<string, DtoFieldOverride>
  /** per-relation style override: attrName -> style */
  relationStyle?: Record<string, RelationStyle>
}

/** DTO config for one entity */
export interface DtoSpec {
  entity: CanvasBox                          // source entity
  name: string                               // DTO name (TS)
  io: DtoIO
  purpose: DtoPurpose
  /** default styles for relations unless overridden per field */
  defaultRelationStyle?: RelationStyle
  /** how deep we embed other entities when style = 'embed' or 'both' */
  embedDepth?: number                        // 0 = only this entity, 1 = first-level relations, etc.
  /** visibility policy (filter attributes by visibility) */
  visibility?: VisibilityPolicy
  /** requiredness policy for input/create/update */
  requiredByDefault?: boolean
  /** allow id fields as required even if not in includeAttrs (for update) */
  preserveId?: boolean
  /** custom mapping rules */
  overrides?: DtoOverrides
}
