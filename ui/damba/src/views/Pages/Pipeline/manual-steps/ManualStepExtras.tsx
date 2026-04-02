import { HiOutlinePuzzle } from 'react-icons/hi'

const ManualStepExtras = () => {
    return (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Define extras and extra hooks for your services.
                Extras are reusable helper functions that can be called from behaviors.
            </p>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                    <HiOutlinePuzzle className="text-xl text-violet-400" />
                </div>
                <p className="text-sm font-medium dark:text-gray-200 mb-1">
                    Extras Editor
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    You can configure extras in detail from the Workspace after project setup.
                    Skip this step to continue, or use the workspace App tab to add extras later.
                </p>
            </div>
        </div>
    )
}

export default ManualStepExtras
