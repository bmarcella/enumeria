import { usePipelineStore, PipelineStepId } from '@/stores/usePipelineStore'
import { HiOutlineCheckCircle } from 'react-icons/hi'

const appTypeConfig: Record<string, { label: string; border: string; bg: string; badge: string; text: string }> = {
    api: { label: 'API', border: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950', badge: 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-300' },
    microservice: { label: 'Microservice', border: 'border-cyan-200 dark:border-cyan-800', bg: 'bg-cyan-50 dark:bg-cyan-950', badge: 'bg-cyan-200 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-300', text: 'text-cyan-700 dark:text-cyan-300' },
    ui: { label: 'UI', border: 'border-green-200 dark:border-green-800', bg: 'bg-green-50 dark:bg-green-950', badge: 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300', text: 'text-green-700 dark:text-green-300' },
    workers: { label: 'Worker', border: 'border-orange-200 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-950', badge: 'bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-300', text: 'text-orange-700 dark:text-orange-300' },
}

const defaultConfig = { label: 'App', border: 'border-gray-200 dark:border-gray-700', bg: 'bg-gray-50 dark:bg-gray-900', badge: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300', text: 'text-gray-600' }

const AppCard = ({ app }: { app: any }) => {
    const cfg = appTypeConfig[app.type_app] ?? defaultConfig
    return (
        <div className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3`}>
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                <span className="font-medium text-sm dark:text-gray-200">{app.name}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{app.description}</p>
        </div>
    )
}

const StepProjectApps = () => {
    const stepState = usePipelineStore((s) => s.steps[PipelineStepId.PROJECT_AND_APPS])
    const data = stepState?.data

    if (!data) return <p className="text-gray-500">No data yet.</p>

    const { project, applications } = data
    const { apis = [], uis = [], workers = [], databasePkg, validatorsPkg, policiesPkg } = applications ?? {}
    const allApps = [...apis, ...uis, ...workers]

    return (
        <div className="space-y-6">
            {/* Project info */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <HiOutlineCheckCircle className="text-green-500" />
                    <h3 className="text-lg font-semibold dark:text-white">{project?.name}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project?.description}</p>
            </div>

            {/* Applications */}
            <div>
                <h4 className="font-semibold mb-3 dark:text-gray-200">
                    Applications
                    <span className="ml-2 text-xs font-normal text-gray-400">({allApps.length})</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allApps.map((app: any) => (
                        <AppCard key={app.id} app={app} />
                    ))}
                </div>
            </div>

            {/* Shared Packages */}
            <div>
                <h4 className="font-semibold mb-3 dark:text-gray-200">Shared Packages</h4>
                <div className="flex flex-wrap gap-2">
                    {databasePkg && (
                        <span className="text-xs px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">{databasePkg.name}</span>
                    )}
                    {validatorsPkg && (
                        <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">{validatorsPkg.name}</span>
                    )}
                    {policiesPkg && (
                        <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">{policiesPkg.name}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StepProjectApps
