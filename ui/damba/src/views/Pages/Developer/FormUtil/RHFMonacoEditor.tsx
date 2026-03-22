/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Controller, Control } from 'react-hook-form'
import Editor from '@monaco-editor/react'

type Props = {
    control: Control<any>
    name: string
    label?: string
    height?: number | string
    language?: string
    theme?: 'vs-dark' | 'light' | string
    helperText?: React.ReactNode
    errorText?: string
    disabled?: boolean

    // Monaco options override
    options?: Record<string, any>

    // Optional actions displayed on the right side of the label row
    actions?: React.ReactNode
}

export default function RHFMonacoEditor({
    control,
    name,
    label,
    height = 360,
    language = 'typescript',
    theme = 'vs-dark',
    helperText,
    errorText,
    disabled,
    options,
    actions,
}: Props) {
    return (
        <div className="space-y-2">
            {(label || actions) && (
                <div className="flex items-center justify-between">
                    {label ? (
                        <label className="text-sm font-medium">{label}</label>
                    ) : (
                        <span />
                    )}
                    {actions}
                </div>
            )}

            <Controller
                control={control}
                name={name as any}
                render={({ field }) => (
                    <div className="rounded-xl overflow-hidden border bg-background">
                        <Editor
                            height={
                                typeof height === 'number'
                                    ? `${height}px`
                                    : height
                            }
                            language={language}
                            theme={theme}
                            value={field.value ?? ''}
                            onChange={(v) => field.onChange(v ?? '')}
                            options={{
                                readOnly: !!disabled,
                                minimap: { enabled: false },
                                fontSize: 13,
                                tabSize: 2,
                                insertSpaces: true,
                                wordWrap: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                formatOnPaste: true,
                                formatOnType: true,
                                suggestOnTriggerCharacters: true,
                                ...options,
                            }}
                        />
                    </div>
                )}
            />
            {errorText && <p className="text-xs text-red-500">{errorText}</p>}
            {helperText && (
                <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
        </div>
    )
}
