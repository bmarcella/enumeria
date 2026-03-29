/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'
import { usePipelineStore, PipelineStepId } from '@/stores/usePipelineStore'

const StepServices = () => {
    const stepState = usePipelineStore((s) => s.steps[PipelineStepId.MODULES])
    const services = stepState?.data?.services ?? []

    const grouped = useMemo(() => {
        const map = new Map<string, { moduleName: string; services: any[] }>()
        for (const svc of services) {
            const modName = svc.module?.name ?? svc.moduleName ?? 'Unknown module'
            const modId = svc.module?.id ?? svc.moduleId ?? modName
            if (!map.has(modId)) {
                map.set(modId, { moduleName: modName, services: [] })
            }
            map.get(modId)!.services.push(svc)
        }
        return [...map.values()]
    }, [services])

    if (!services.length) return <p className="text-gray-500">No services generated yet.</p>

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {services.length} service{services.length !== 1 ? 's' : ''} across {grouped.length} module{grouped.length !== 1 ? 's' : ''}
            </p>

            {grouped.map((group) => (
                <div key={group.moduleName}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#fb732c]">
                            {group.moduleName}
                        </span>
                        <span className="text-xs text-gray-400">
                            ({group.services.length})
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.services.map((svc: any, idx: number) => {
                            const crud = svc.crudConfig as Record<string, boolean> | undefined
                            return (
                                <div
                                    key={svc.id ?? idx}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm dark:text-gray-200">
                                            {svc.name}
                                        </span>
                                        {svc.defaultEntity && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                                {svc.defaultEntity}
                                            </span>
                                        )}
                                    </div>
                                    {svc.description && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            {svc.description}
                                        </p>
                                    )}
                                    {crud && (
                                        <div className="flex gap-1.5 flex-wrap">
                                            {Object.entries(crud).map(([op, enabled]) => (
                                                <span
                                                    key={op}
                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                        enabled
                                                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through'
                                                    }`}
                                                >
                                                    {op.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default StepServices
