import { HiOutlineChip } from 'react-icons/hi'

const ManualStepBehaviors = () => {
    return (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Define behavior chains, behaviors, and hooks for your services.
                Each behavior represents an HTTP endpoint, and hooks implement the handler logic.
            </p>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                    <HiOutlineChip className="text-xl text-cyan-400" />
                </div>
                <p className="text-sm font-medium dark:text-gray-200 mb-1">
                    Behavior Editor
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    You can configure behaviors in detail from the Workspace after project setup.
                    Skip this step to continue, or use the workspace App tab to add behaviors later.
                </p>
            </div>
        </div>
    )
}

export default ManualStepBehaviors
