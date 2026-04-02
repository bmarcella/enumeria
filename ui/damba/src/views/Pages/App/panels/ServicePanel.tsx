/* eslint-disable @typescript-eslint/no-explicit-any */
import { HiOutlineCollection, HiOutlineLink, HiOutlinePuzzle } from 'react-icons/hi'

type Props = { data: any }

const ServicePanel = ({ data }: Props) => {
    const chainCount = data.behaviorChains?.length ?? 0
    const extraCount = data.extras?.length ?? 0
    const behaviorCount = (data.behaviorChains ?? []).reduce(
        (acc: number, c: any) => acc + (c.behaviors?.length ?? 0),
        0,
    )

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E293B] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <HiOutlineCollection className="text-lg text-blue-400" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        {data.name}
                    </h2>
                    <p className="text-[11px] text-gray-500">Service</p>
                </div>
            </div>

            {/* Description */}
            {data.description && (
                <div className="px-5 py-3 border-b border-[#1E293B]">
                    <p className="text-xs text-gray-400">{data.description}</p>
                </div>
            )}

            {/* Stats */}
            <div className="px-5 py-4 grid grid-cols-3 gap-3">
                <div className="bg-[#0F172A] rounded-lg p-3 border border-[#1E293B]">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <HiOutlineLink className="text-sm" />
                        <span className="text-[10px] uppercase tracking-wider">
                            Chains
                        </span>
                    </div>
                    <span className="text-lg font-bold text-white">
                        {chainCount}
                    </span>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-3 border border-[#1E293B]">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <HiOutlineLink className="text-sm" />
                        <span className="text-[10px] uppercase tracking-wider">
                            Behaviors
                        </span>
                    </div>
                    <span className="text-lg font-bold text-white">
                        {behaviorCount}
                    </span>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-3 border border-[#1E293B]">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <HiOutlinePuzzle className="text-sm" />
                        <span className="text-[10px] uppercase tracking-wider">
                            Extras
                        </span>
                    </div>
                    <span className="text-lg font-bold text-white">
                        {extraCount}
                    </span>
                </div>
            </div>

            {/* Config */}
            {data.defaultEntity && (
                <div className="px-5 py-3 border-t border-[#1E293B]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">
                        Default Entity
                    </span>
                    <code className="text-xs text-cyan-400 bg-[#0F172A] px-2 py-1 rounded border border-[#1E293B]">
                        {data.defaultEntity}
                    </code>
                </div>
            )}

            {data.crudConfig && (
                <div className="px-5 py-3 border-t border-[#1E293B]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">
                        CRUD Config
                    </span>
                    <pre className="text-[11px] text-gray-400 bg-[#0F172A] p-3 rounded border border-[#1E293B] overflow-x-auto">
                        {JSON.stringify(data.crudConfig, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}

export default ServicePanel
