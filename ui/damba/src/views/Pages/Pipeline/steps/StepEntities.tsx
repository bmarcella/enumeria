import { usePipelineStore, PipelineStepId } from '@/stores/usePipelineStore'
import DataModelerView from '@/views/Pages/DataModeler/DataModelerView'

const StepEntities = () => {
    const stepState = usePipelineStore((s) => s.steps[PipelineStepId.ENTITIES])
    const entities = stepState?.data?.entities ?? []

    if (!entities.length) return <p className="text-gray-500">No entities generated yet.</p>

    return (
        <div className="h-[calc(100vh-12rem)] min-h-[600px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <DataModelerView initialEntities={entities} />
        </div>
    )
}

export default StepEntities
