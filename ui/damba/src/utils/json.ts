/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function safeParseJsonObjectOrNull(
    value: unknown,
): Record<string, any> | null {
    if (value === null || value === undefined) return null

    // already object from API
    if (typeof value === 'object') return value as Record<string, any>

    // empty string => null
    if (typeof value === 'string') {
        const s = value.trim()
        if (!s) return null

        try {
            const parsed = JSON.parse(s)
            if (parsed === null) return null
            if (typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('JSON must be an object')
            }
            return parsed as Record<string, any>
        } catch (err) {
            throw new Error('Invalid JSON object')
        }
    }

    throw new Error('Invalid schema value')
}

export function prettyJson(value: any): string {
    if (value === null || value === undefined) return ''
    try {
        return JSON.stringify(value, null, 2)
    } catch {
        return ''
    }
}
