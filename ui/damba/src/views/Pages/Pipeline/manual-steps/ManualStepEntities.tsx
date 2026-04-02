import DataModelerView from '@/views/Pages/DataModeler/DataModelerView'

const ManualStepEntities = () => {
    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 shrink-0">
                Design your data model. Add entities, define columns, and set up relationships.
            </p>
            <div className="flex-1 min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <DataModelerView />
            </div>
        </div>
    )
}

export default ManualStepEntities
