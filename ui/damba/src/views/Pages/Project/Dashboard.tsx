/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
    HiOutlineCube,
    HiOutlineSparkles,
    HiOutlinePlus,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineExclamation,
    HiTrash,
} from 'react-icons/hi'
import { useProjectStore, selectProjects } from '@/stores/useProjectStore'
import { useSessionUser } from '@/stores/authStore'
import { usePipelineStore, getResumeStepIndex, getCompletionPercent } from '@/stores/usePipelineStore'
import { useManualPipelineStore } from '@/stores/useManualPipelineStore'
import { deleteProject } from '@/services/Project'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import classNames from 'classnames'
import Header from '@/components/template/Header'
import HeaderLogo from '@/components/template/HeaderLogo'
import type { CurrentSetting } from '../../../../../../common/Damba/v2/Entity/UserDto'
import OrgSwitcher from '@/views/IDE/OrgSwitcher'

type LoadingMap = Record<string, boolean>

const Dashboard = () => {
    const projects = useProjectStore(selectProjects)
    const setProject = useProjectStore((s) => s.setProject)
    const removeProject = useProjectStore((s) => s.removeProject)
    const user = useSessionUser((s) => s.user)
    const setUser = useSessionUser((s) => s.setUser)
    const startPipeline = usePipelineStore((s) => s.startPipeline)
    const resumePipeline = usePipelineStore((s) => s.resumePipeline)
    const startManualPipeline = useManualPipelineStore(
        (s) => s.startManualPipeline,
    )
    const navigate = useNavigate()
    const [message, setMessage] = useTimeOutMessage()
    const [loading, setLoading] = useState<LoadingMap>({})

    const completedProjects = projects.filter((p: any) => !p.buildStatus || p.buildStatus === 'completed')
    const inProgressProjects = projects.filter((p: any) => p.buildStatus && p.buildStatus !== 'completed' && p.buildStatus !== 'failed')
    const failedProjects = projects.filter((p: any) => (p as any).buildStatus === 'failed')

    const openProject = (id: string) => {
        const proj = projects.find((p) => p.id === id) as any
        const buildStatus = proj?.buildStatus

        if (buildStatus && buildStatus !== 'completed') {
            const isManual = proj?.buildingType === 'manual'

            if (isManual) {
                const apps: any[] = proj?.applications ?? []
                const BACKEND_TYPES = new Set([
                    'api', 'microservice', 'daemon', 'workers', 'cli', 'library',
                ])
                const hasBackend = apps.some((a: any) =>
                    BACKEND_TYPES.has(a.type_app),
                )
                startManualPipeline(id, hasBackend, apps)
                navigate('/manual-pipeline')
                return
            }

            const resumeAt = getResumeStepIndex(buildStatus, proj?.lastCompletedStep)
            if (resumeAt >= 0) {
                resumePipeline(id, proj?.initialPrompt ?? proj?.description ?? '', resumeAt)
                navigate('/pipeline')
                return
            }
        }

        if (user) {
            setUser({
                ...user,
                currentSetting: {
                    ...user.currentSetting,
                    projId: id,
                    moduleId: '',
                    servId: '',
                    env: undefined,
                } as CurrentSetting,
            })
        }
        setProject(id)
        navigate('/workspace')
    }

    const handleNewProject = () => {
        navigate('/new-project')
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B1120] text-gray-300">
            {/* Header */}
            <Header
                className="border-b border-[#1E293B] !bg-[#0F172A]"
                headerStart={
                    <div className="flex items-center gap-3">
                        <HeaderLogo />
                        <span className="w-px h-5 bg-[#1E293B]" />
                        <OrgSwitcher />
                    </div>
                }
                headerEnd={
                    <button
                        onClick={handleNewProject}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#fb732c] text-white hover:bg-[#e5631f] transition-colors shadow-lg shadow-[#fb732c]/20"
                    >
                        <HiOutlinePlus className="text-base" />
                        New Project
                    </button>
                }
            />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <HiOutlineCheckCircle className="text-xl text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{completedProjects.length}</p>
                            <p className="text-xs text-gray-500">Active Projects</p>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <HiOutlineClock className="text-xl text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{inProgressProjects.length}</p>
                            <p className="text-xs text-gray-500">In Progress</p>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <HiOutlineExclamation className="text-xl text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{failedProjects.length}</p>
                            <p className="text-xs text-gray-500">Failed</p>
                        </div>
                    </div>
                </div>

                {/* Projects */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Projects</h2>
                    <span className="text-xs text-gray-500">{projects.length} total</span>
                </div>

                {projects.length === 0 ? (
                    <div className="border-2 border-dashed border-[#1E293B] rounded-xl p-16 text-center">
                        <HiOutlineSparkles className="text-5xl text-[#fb732c] mx-auto mb-4" />
                        <p className="text-white font-semibold text-lg mb-1">No projects yet</p>
                        <p className="text-gray-500 text-sm mb-6">Create your first project with AI</p>
                        <button
                            onClick={handleNewProject}
                            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#fb732c] text-white hover:bg-[#e5631f] transition-colors shadow-lg shadow-[#fb732c]/20"
                        >
                            <HiOutlinePlus className="inline mr-2" />
                            New Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* New project card */}
                        <button
                            onClick={handleNewProject}
                            className="border-2 border-dashed border-[#1E293B] rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#fb732c]/50 hover:bg-[#fb732c]/5 transition-all min-h-[180px] group"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#21262d] flex items-center justify-center group-hover:bg-[#fb732c]/10 transition-colors">
                                <HiOutlinePlus className="text-xl text-gray-500 group-hover:text-[#fb732c] transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 group-hover:text-[#fb732c] transition-colors">
                                New Project
                            </span>
                        </button>

                        {/* Project cards */}
                        {projects.map((project) => {
                            const id = String(project.id)
                            const isLoading = !!loading[id]
                            const buildStatus = (project as any).buildStatus as string | undefined
                            const isComplete = !buildStatus || buildStatus === 'completed'
                            const isFailed = buildStatus === 'failed'
                            const isBuilding = buildStatus === 'in_progress' || buildStatus === 'initializing'
                            const completionPct = !isComplete
                                ? getCompletionPercent(buildStatus, (project as any).lastCompletedStep)
                                : 100

                            return (
                                <div
                                    key={id}
                                    className={classNames(
                                        'bg-[#0F172A] border rounded-xl overflow-hidden transition-all hover:shadow-xl cursor-pointer group',
                                        isFailed ? 'border-red-800/50' : isBuilding ? 'border-amber-800/50' : 'border-[#1E293B] hover:border-[#fb732c]/40',
                                    )}
                                    onClick={() => openProject(id)}
                                >
                                    {/* Progress bar for incomplete */}
                                    {!isComplete && (
                                        <div className="h-1 bg-[#21262d]">
                                            <div
                                                className={classNames(
                                                    'h-full transition-all duration-500',
                                                    isFailed ? 'bg-red-500' : 'bg-amber-500',
                                                )}
                                                style={{ width: `${completionPct}%` }}
                                            />
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={classNames(
                                                'w-10 h-10 rounded-lg flex items-center justify-center',
                                                isComplete ? 'bg-[#fb732c]/10 text-[#fb732c]' :
                                                isFailed ? 'bg-red-500/10 text-red-400' :
                                                'bg-amber-500/10 text-amber-400',
                                            )}>
                                                <HiOutlineCube className="text-lg" />
                                            </div>
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                {!isComplete && (
                                                    <span className={classNames(
                                                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                                                        isFailed ? 'bg-red-900/40 text-red-400' : 'bg-amber-900/40 text-amber-400',
                                                    )}>
                                                        {isFailed ? 'Failed' : `${completionPct}%`}
                                                    </span>
                                                )}
                                                <button
                                                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                                    disabled={isLoading}
                                                    onClick={async (e) => {
                                                        e.stopPropagation()
                                                        try {
                                                            setLoading((p) => ({ ...p, [id]: true }))
                                                            await deleteProject(id)
                                                            removeProject(id)
                                                        } catch {
                                                            setMessage('Failed to delete')
                                                        } finally {
                                                            setLoading((p) => ({ ...p, [id]: false }))
                                                        }
                                                    }}
                                                >
                                                    <HiTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-white text-sm truncate mb-1 group-hover:text-[#fb732c] transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>

                                    <div className="px-5 py-3 border-t border-[#1E293B] bg-[#0B1120]/50 flex items-center justify-between">
                                        <span className="text-[10px] text-gray-600 font-mono">
                                            {isComplete ? 'Ready' : isBuilding ? 'Building...' : 'Failed'}
                                        </span>
                                        <span className="text-[10px] text-[#fb732c] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                            {isComplete ? 'Open IDE →' : 'Continue →'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
