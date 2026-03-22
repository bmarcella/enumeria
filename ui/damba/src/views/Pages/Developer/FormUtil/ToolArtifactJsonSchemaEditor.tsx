/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Button } from '@/components/ui'
import { Control, UseFormReturn } from 'react-hook-form'
import { ToolArtifactFormValues } from '@/validators/toolArtifactsSchema'
import RHFMonacoEditor from './RHFMonacoEditor'

type Props = {
    control: Control<any>
    form: UseFormReturn<any>
    name: 'inputSchema' | 'outputSchema' | (string & {}) // allow other RHF paths if you want
    label: string
    helperText?: React.ReactNode
    errorText?: string
    template?: any // object or JSON string
    height?: number
}

const DEFAULT_JSON_TEMPLATE_OBJ = {
    type: 'object',
    properties: {
        query: { type: 'string' },
    },
    required: ['query'],
}

function toJsonText(v: unknown): string {
    if (v === undefined || v === null) return ''
    if (typeof v === 'string') return v
    try {
        return JSON.stringify(v, null, 2)
    } catch {
        return String(v)
    }
}

function parseJsonObjectOrNull(txt: string): Record<string, unknown> | null {
    const s = (txt ?? '').trim()
    if (!s) return null
    const parsed = JSON.parse(s)
    const isObj =
        typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    if (!isObj) throw new Error('JSON must be an object')
    return parsed as Record<string, unknown>
}

export default function ToolArtifactJsonSchemaEditor({
    control,
    form,
    name,
    label,
    helperText,
    errorText,
    template = DEFAULT_JSON_TEMPLATE_OBJ,
    height = 260,
}: Props) {
    return (
        <RHFMonacoEditor
            control={control as any}
            name={name}
            label={label}
            language="json"
            height={height}
            errorText={errorText}
            actions={
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="default"
                        onClick={() => {
                            const current = form.getValues(name as any)
                            const txt = toJsonText(current)
                            if (!txt.trim()) return
                            // Normalize formatting (string + newline)
                            form.setValue(name as any, txt.trimEnd() + '\n', {
                                shouldDirty: true,
                                shouldValidate: true,
                            })
                        }}
                    >
                        Trim
                    </Button>

                    <Button
                        type="button"
                        variant="default"
                        onClick={() => {
                            const txt =
                                typeof template === 'string'
                                    ? template
                                    : JSON.stringify(template, null, 2)
                            form.setValue(
                                name as any,
                                txt + (txt.endsWith('\n') ? '' : '\n'),
                                {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                },
                            )
                        }}
                    >
                        Template
                    </Button>

                    <Button
                        type="button"
                        variant="default"
                        onClick={() => {
                            try {
                                const current = toJsonText(
                                    form.getValues(name as any),
                                )
                                // Validate that it parses and is an object (or empty -> null)
                                const parsed = parseJsonObjectOrNull(current)

                                // Optional: pretty-print normalization after validation
                                const pretty =
                                    parsed === null
                                        ? ''
                                        : JSON.stringify(parsed, null, 2) + '\n'
                                form.setValue(name as any, pretty, {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                })

                                form.clearErrors(name as any)
                            } catch {
                                form.setError(name as any, {
                                    type: 'manual',
                                    message:
                                        'Invalid JSON (must be an object).',
                                })
                            }
                        }}
                    >
                        Validate JSON
                    </Button>
                </div>
            }
            options={{
                wordWrap: 'on',
            }}
            helperText={helperText}
        />
    )
}
