/* eslint-disable @typescript-eslint/no-explicit-any */
import { HiOutlinePuzzle, HiOutlineDocument } from 'react-icons/hi'

type Props = { data: any }

const ExtraPanel = ({ data }: Props) => {
    const hooks: any[] = data.extra_hooks ?? []

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E293B] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <HiOutlinePuzzle className="text-lg text-violet-400" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        {data.name}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                        Extra &middot; {hooks.length} hook
                        {hooks.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {data.description && (
                <div className="px-5 py-3 border-b border-[#1E293B]">
                    <p className="text-xs text-gray-400">{data.description}</p>
                </div>
            )}

            {/* Context flag */}
            <div className="px-5 py-3 border-b border-[#1E293B] flex items-center gap-2">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Context Needed
                </span>
                <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${data.isContextNeeded ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}
                >
                    {data.isContextNeeded ? 'Yes' : 'No'}
                </span>
            </div>

            {/* Hooks list */}
            <div className="px-5 py-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-3">
                    Hooks
                </span>
                {hooks.length === 0 ? (
                    <p className="text-xs text-gray-600">
                        No hooks defined for this extra.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {hooks.map((hook: any) => (
                            <div
                                key={hook.id}
                                className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3 flex items-center gap-3"
                            >
                                <HiOutlineDocument className="text-violet-300 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs text-gray-300 block">
                                        {hook.name}
                                    </span>
                                    {hook.description && (
                                        <span className="text-[11px] text-gray-600 block">
                                            {hook.description}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-600">
                                    Click to edit
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ExtraPanel
