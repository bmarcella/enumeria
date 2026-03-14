// dto/typeMapping.ts

import { TypeAttbutesTypeOrm } from "./TypeAttributesTypeOrm"

export function ormTypeToTs(type: TypeAttbutesTypeOrm | string | undefined): string {
    switch (type) {
        case TypeAttbutesTypeOrm.UUID:
        case TypeAttbutesTypeOrm.VARCHAR:
        case TypeAttbutesTypeOrm.TEXT:
        case TypeAttbutesTypeOrm.DATE:
        case TypeAttbutesTypeOrm.DATETIME:
        case TypeAttbutesTypeOrm.TIMESTAMP:
            return 'string'
        case TypeAttbutesTypeOrm.INT:
        case TypeAttbutesTypeOrm.FLOAT:
        case TypeAttbutesTypeOrm.DECIMAL:
            return 'number'
        case TypeAttbutesTypeOrm.BOOLEAN:
            return 'boolean'
        case TypeAttbutesTypeOrm.JSON:
            return 'Record<string, unknown>'
        default:
            // if user used a string custom type or entity id
            return typeof type === 'string' ? type : 'any'
    }
}

export function idTsType(): string {
    return 'string' // or 'string | number' if some ids are numeric
}
