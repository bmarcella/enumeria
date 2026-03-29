import { usePipelineStore, PipelineStepId } from '@/stores/usePipelineStore'

type Props = {
    stepId: PipelineStepId
    title: string
    renderItem?: (item: any, index: number) => React.ReactNode
    dataKey?: string
}

const defaultRenderItem = (item: any, index: number) => (
    <div key={item.id ?? index} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{item.name ?? item.entityName ?? `Item ${index + 1}`}</span>
        </div>
        {item.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
        )}
    </div>
)

const StepGeneric = ({ stepId, title, renderItem = defaultRenderItem, dataKey }: Props) => {
    const stepState = usePipelineStore((s) => s.steps[stepId])
    const rawData = stepState?.data

    const items = dataKey ? rawData?.[dataKey] : rawData
    const list = Array.isArray(items) ? items : items ? [items] : []

    if (!list.length) return <p className="text-gray-500">No {title.toLowerCase()} generated yet.</p>

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">{list.length} {title.toLowerCase()} generated</p>
            {list.map((item, idx) => renderItem(item, idx))}
        </div>
    )
}

export default StepGeneric
