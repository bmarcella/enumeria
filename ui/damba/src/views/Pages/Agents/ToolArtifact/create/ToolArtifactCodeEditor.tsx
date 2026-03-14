/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { Button } from '@/components/ui'
import { Control, UseFormReturn } from 'react-hook-form'
import {
    TEMPLATE_CODE_TOOL,
    ToolArtifactFormValues,
} from '@/validators/toolArtifactsSchema'
import RHFMonacoEditor from './RHFMonacoEditor'

type Props = {
    control: Control<ToolArtifactFormValues>
    form: UseFormReturn<ToolArtifactFormValues>
    runtime?: string
    errorText?: string
}

export default function ToolArtifactCodeEditor({
    control,
    form,
    runtime,
    errorText,
}: Props) {
    return (
        <RHFMonacoEditor
            control={control as any}
            name="code"
            label="Code"
            language="typescript"
            height={360}
            errorText={errorText}
            actions={
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="default"
                        onClick={() => {
                            const current = form.getValues('code') ?? ''
                            if (!current.trim()) return
                            form.setValue('code', current.trimEnd() + '\n', {
                                shouldDirty: true,
                            })
                        }}
                    >
                        Trim
                    </Button>

                    <Button
                        type="button"
                        variant="default"
                        onClick={() => {
                            form.setValue('code', TEMPLATE_CODE_TOOL, {
                                shouldDirty: true,
                                shouldValidate: true,
                            })
                        }}
                    >
                        Template
                    </Button>
                </div>
            }
            helperText={
                <>
                    Runtime: <b>{runtime ?? 'node_vm'}</b> — exports required:{' '}
                    <code>run(input)</code>
                </>
            }
        />
    )
}
