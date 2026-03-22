/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from 'react'
import { Input, Select } from '@/components/ui'
import { useToolArtifactsStore } from '@/stores/toolArtifactsStore'

export function ToolConfigPanel({
    toolType,
    register,
    idx,
    control,
    watch,
    setValue,
}: {
    toolType: string
    register: any
    idx: number
    control: any
    watch: any
    setValue: any
}) {
    const base = `tools.${idx}.config`

    const {
        items,
        fetchList,
        loading = false,
    } = useToolArtifactsStore()

    useEffect(() => {
        if (toolType === 'custom_plugin' && fetchList) {
            fetchList()
        }
    }, [toolType, fetchList])

    const toolArtifactOptions = useMemo(
        () =>
            (items ?? []).map((x: any) => ({
                value: x.id,
                label: `${x.name} (${x.version ?? '-'})`,
            })),
        [items],
    )

    if (toolType === 'http') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                    <label className="text-sm font-medium">URL</label>
                    <Input
                        placeholder="https://..."
                        {...register(`${base}.url`)}
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Method</label>
                    <Input placeholder="POST" {...register(`${base}.method`)} />
                </div>
                <div className="md:col-span-3">
                    <label className="text-sm font-medium">
                        Headers (JSON string)
                    </label>
                    <Input
                        textArea
                        placeholder='{"Authorization":"Bearer ..."}'
                        {...register(`${base}.headersJson`)}
                    />
                </div>
            </div>
        )
    }

    if (toolType === 'custom_plugin') {
        const selectedToolArtifactId = watch(`${base}.toolArtifactId`)
        const selectedToolArtifact = (items ?? []).find(
            (x: any) => x.id === selectedToolArtifactId,
        )

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                    <label className="text-sm font-medium">
                        Tool artifact
                    </label>
                    <Select
                        options={toolArtifactOptions}
                        value={
                            toolArtifactOptions.find(
                                (o) => o.value === selectedToolArtifactId,
                            ) ?? null
                        }
                        onChange={(o: any) => {
                            setValue(`${base}.toolArtifactId`, o?.value ?? '', {
                                shouldDirty: true,
                                shouldValidate: true,
                            })
                        }}
                        placeholder={
                            loading
                                ? 'Loading tool artifacts...'
                                : 'Select a tool artifact'
                        }
                    />
                </div>

                {selectedToolArtifact && (
                    <div className="md:col-span-3 text-xs text-muted-foreground">
                        runtime: {selectedToolArtifact.runtime ?? '-'} • version:{' '}
                        {selectedToolArtifact.version ?? '-'} • status:{' '}
                        {selectedToolArtifact.status ?? '-'}
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium">runtime</label>
                    <Input
                        placeholder="container | wasm | node_vm"
                        {...register(`${base}.runtime`)}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">timeoutMs</label>
                    <Input
                        type="number"
                        {...register(`${base}.limits.timeoutMs`, {
                            valueAsNumber: true,
                        })}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">maxMemoryMb</label>
                    <Input
                        type="number"
                        {...register(`${base}.limits.maxMemoryMb`, {
                            valueAsNumber: true,
                        })}
                    />
                </div>

                <div className="md:col-span-3">
                    <label className="text-sm font-medium">permissions</label>
                    <Input
                        placeholder="architecture.read, qdrant.query"
                        {...register(`${base}.permissionsCsv`)}
                    />
                </div>
            </div>
        )
    }

    return (
        <div>
            <label className="text-sm font-medium">Config (advanced)</label>
            <Input
                textArea
                placeholder="Put tool-specific config here"
                {...register(`${base}.notes`)}
            />
        </div>
    )
}

export default ToolConfigPanel