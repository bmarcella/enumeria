/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { usePipelineStore, PipelineStepId } from '@/stores/usePipelineStore'
import { HiChevronDown, HiChevronRight, HiOutlineShieldCheck, HiOutlineLockClosed } from 'react-icons/hi'

const StepMiddlewaresPolicies = () => {
    const stepState = usePipelineStore((s) => s.steps[PipelineStepId.MIDDLEWARES_POLICIES])
    const middlewares = stepState?.data?.middlewares ?? []
    const [expandedId, setExpandedId] = useState<string | null>(null)

    if (!middlewares.length) return <p className="text-gray-500">No middlewares generated yet.</p>

    // Group middlewares by their policies (if they have any)
    // Each middleware may have policies[] from the relation
    // We show policies as the top-level items, with middlewares nested inside

    // Build a list of unique policies from all middlewares
    const policyMap = new Map<string, { policy: any; middlewares: any[] }>()
    const standaloneMiddlewares: any[] = []

    for (const mw of middlewares) {
        if (mw.policies && mw.policies.length > 0) {
            for (const pol of mw.policies) {
                const key = pol.id ?? pol.name
                if (!policyMap.has(key)) {
                    policyMap.set(key, { policy: pol, middlewares: [] })
                }
                policyMap.get(key)!.middlewares.push(mw)
            }
        } else {
            standaloneMiddlewares.push(mw)
        }
    }

    const policies = [...policyMap.values()]
    const hasPolicies = policies.length > 0

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {middlewares.length} middleware{middlewares.length !== 1 ? 's' : ''}
                {hasPolicies && ` · ${policies.length} polic${policies.length !== 1 ? 'ies' : 'y'}`}
            </p>

            {/* Policies with nested middlewares */}
            {hasPolicies && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Policies
                    </h4>
                    {policies.map(({ policy, middlewares: policyMws }) => {
                        const id = policy.id ?? policy.name
                        const isExpanded = expandedId === id

                        return (
                            <div
                                key={id}
                                className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : id)}
                                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <HiOutlineShieldCheck className="text-lg text-indigo-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm dark:text-gray-200 truncate">
                                                {policy.name}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                                                {policyMws.length} mw
                                            </span>
                                        </div>
                                        {policy.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                {policy.description}
                                            </p>
                                        )}
                                    </div>
                                    {isExpanded ? (
                                        <HiChevronDown className="text-gray-400 flex-shrink-0" />
                                    ) : (
                                        <HiChevronRight className="text-gray-400 flex-shrink-0" />
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                        {policyMws.map((mw: any, idx: number) => (
                                            <div
                                                key={mw.id ?? idx}
                                                className="flex items-center gap-3 px-4 py-2.5 border-b last:border-b-0 border-gray-100 dark:border-gray-800"
                                            >
                                                <HiOutlineLockClosed className="text-sm text-amber-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="text-xs font-medium dark:text-gray-300">
                                                        {mw.name}
                                                    </span>
                                                    {mw.description && (
                                                        <p className="text-[11px] text-gray-400 truncate">
                                                            {mw.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Standalone middlewares (not attached to any policy) */}
            {standaloneMiddlewares.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        {hasPolicies ? 'Standalone Middlewares' : 'Middlewares'}
                    </h4>
                    {standaloneMiddlewares.map((mw: any, idx: number) => (
                        <div
                            key={mw.id ?? idx}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3"
                        >
                            <HiOutlineLockClosed className="text-lg text-amber-500 flex-shrink-0" />
                            <div className="min-w-0">
                                <span className="font-medium text-sm dark:text-gray-200">
                                    {mw.name}
                                </span>
                                {mw.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {mw.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default StepMiddlewaresPolicies
