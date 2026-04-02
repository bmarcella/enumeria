/* eslint-disable @typescript-eslint/no-explicit-any */
import { HiOutlineLink, HiOutlineCode } from 'react-icons/hi'
import classNames from 'classnames'

type Props = { data: any }

const methodColors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    POST: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PUT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PATCH: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const BehaviorChainPanel = ({ data }: Props) => {
    const behaviors: any[] = data.behaviors ?? []

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E293B] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <HiOutlineLink className="text-lg text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        {data.name}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                        Behavior Chain &middot; {behaviors.length} behavior
                        {behaviors.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {data.description && (
                <div className="px-5 py-3 border-b border-[#1E293B]">
                    <p className="text-xs text-gray-400">{data.description}</p>
                </div>
            )}

            {/* Behaviors list */}
            <div className="px-5 py-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-3">
                    Behaviors
                </span>
                {behaviors.length === 0 ? (
                    <p className="text-xs text-gray-600">
                        No behaviors in this chain yet.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {behaviors.map((beh: any) => (
                            <div
                                key={beh.id}
                                className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <HiOutlineCode className="text-green-400 shrink-0" />
                                    <span className="text-xs font-medium text-white">
                                        {beh.name}
                                    </span>
                                </div>
                                <code className="text-[11px] text-gray-400 block mb-2">
                                    {beh.path}
                                </code>
                                {beh.hooks && beh.hooks.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap">
                                        {beh.hooks.map((hook: any) => (
                                            <span
                                                key={hook.id}
                                                className={classNames(
                                                    'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                                                    methodColors[
                                                        hook.method
                                                    ] ?? 'text-gray-400',
                                                )}
                                            >
                                                {hook.method}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BehaviorChainPanel
