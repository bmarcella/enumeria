/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'
import { usePipelineStore, PipelineStepId } from '@/stores/usePipelineStore'

const StepBehaviors = () => {
    const stepState = usePipelineStore((s) => s.steps[PipelineStepId.BEHAVIORS_EXTRAS])
    const chains = stepState?.data?.chains ?? []

    const grouped = useMemo(() => {
        const map = new Map<string, { serviceName: string; chains: any[] }>()
        for (const chain of chains) {
            const svcName = chain.appService?.name ?? chain.serviceName ?? chain.servId ?? 'Unknown service'
            const key = chain.appService?.id ?? chain.servId ?? svcName
            if (!map.has(key)) {
                map.set(key, { serviceName: svcName, chains: [] })
            }
            map.get(key)!.chains.push(chain)
        }
        return [...map.values()]
    }, [chains])

    if (!chains.length) return <p className="text-gray-500">No behavior chains yet.</p>

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {chains.length} chain{chains.length !== 1 ? 's' : ''} across {grouped.length} service{grouped.length !== 1 ? 's' : ''}
            </p>

            {grouped.map((group) => (
                <div key={group.serviceName}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#fb732c]">
                            {group.serviceName}
                        </span>
                        <span className="text-xs text-gray-400">
                            ({group.chains.length})
                        </span>
                    </div>

                    <div className="space-y-2">
                        {group.chains.map((chain: any, idx: number) => (
                            <div
                                key={chain.id ?? idx}
                                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                    CRUD
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-medium text-sm dark:text-gray-200">
                                        {chain.name}
                                    </span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {chain.description ?? 'Default Damba CRUD'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default StepBehaviors
