/* eslint-disable @typescript-eslint/no-explicit-any */
import { HiOutlineCode } from 'react-icons/hi'
import classNames from 'classnames'

type Props = { data: any }

const methodColors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    POST: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PUT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const BehaviorPanel = ({ data }: Props) => {
    const hooks: any[] = data.hooks ?? []

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E293B] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <HiOutlineCode className="text-lg text-green-400" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        {data.name}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                        Behavior &middot;{' '}
                        <code className="text-cyan-400">{data.path}</code>
                    </p>
                </div>
            </div>

            {data.description && (
                <div className="px-5 py-3 border-b border-[#1E293B]">
                    <p className="text-xs text-gray-400">{data.description}</p>
                </div>
            )}

            {/* Hooks */}
            <div className="px-5 py-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-3">
                    HTTP Hooks
                </span>
                {hooks.length === 0 ? (
                    <p className="text-xs text-gray-600">
                        No hooks defined for this behavior.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {hooks.map((hook: any) => (
                            <div
                                key={hook.id}
                                className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3 flex items-center gap-3"
                            >
                                <span
                                    className={classNames(
                                        'text-[10px] font-bold px-2 py-1 rounded border min-w-[52px] text-center',
                                        methodColors[hook.method] ??
                                            'text-gray-400',
                                    )}
                                >
                                    {hook.method}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <code className="text-xs text-gray-300">
                                        {data.path}
                                    </code>
                                </div>
                                <span className="text-[10px] text-gray-600">
                                    Click to edit handler
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BehaviorPanel
