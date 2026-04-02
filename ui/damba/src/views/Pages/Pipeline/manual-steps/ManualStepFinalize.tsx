import { HiOutlineCheckCircle } from 'react-icons/hi'

const ManualStepFinalize = () => {
    return (
        <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <HiOutlineCheckCircle className="text-3xl text-green-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-white mb-2">
                Project Setup Complete
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Your project structure has been created. You can now open the
                Workspace to manage modules, services, behaviors, and extras
                in the full IDE view.
            </p>
        </div>
    )
}

export default ManualStepFinalize
