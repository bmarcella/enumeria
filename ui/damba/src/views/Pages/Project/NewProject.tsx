/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
    HiOutlineChevronLeft,
    HiOutlineSparkles,
    HiOutlinePencilAlt,
    HiOutlinePlus,
    HiOutlineTrash,
} from 'react-icons/hi'
import { usePipelineStore } from '@/stores/usePipelineStore'
import { saveProject } from '@/services/Project'
import { useOrganizationId } from '@/utils/hooks/useOrganization'
import { useSessionUser } from '@/stores/authStore'
import { useProjectStore } from '@/stores/useProjectStore'
import Header from '@/components/template/Header'
import HeaderLogo from '@/components/template/HeaderLogo'
import classNames from 'classnames'
import { DambaEnvironmentType } from '../../../../../../common/Damba/v2/Entity/env'
import { useManualPipelineStore } from '@/stores/useManualPipelineStore'

type CreationMode = 'prompt' | 'manual'

type AppEntry = {
    name: string
    type_app: string
    description: string
}

const APP_TYPES = [
    { value: 'api', label: 'API', color: 'text-blue-400' },
    { value: 'microservice', label: 'Microservice', color: 'text-cyan-400' },
    { value: 'ui', label: 'UI', color: 'text-green-400' },
    { value: 'web', label: 'Web', color: 'text-green-400' },
    { value: 'workers', label: 'Workers', color: 'text-orange-400' },
    { value: 'daemon', label: 'Daemon', color: 'text-red-400' },
    { value: 'cli', label: 'CLI', color: 'text-yellow-400' },
    { value: 'library', label: 'Library', color: 'text-purple-400' },
]

const defaultPrompt = `Create a todo list app that allows users to manage their tasks.
- Add a task with title and description
- Edit a task
- Delete a task
- Mark a task as completed
- View all tasks in a list`

// ── Component ───────────────────────────────────────────────────────────────

const NewProject = () => {
    const navigate = useNavigate()
    const startPipeline = usePipelineStore((s) => s.startPipeline)
    const orgId = useOrganizationId()
    const user = useSessionUser((s) => s.user)
    const setUser = useSessionUser((s) => s.setUser)
    const addProject = useProjectStore((s) => s.addProject)
    const startManualPipeline = useManualPipelineStore(
        (s) => s.startManualPipeline,
    )

    // ── Mode toggle ─────────────────────────────────────────────────────────
    const [mode, setMode] = useState<CreationMode>('prompt')

    // ── Prompt mode state ───────────────────────────────────────────────────
    const [prompt, setPrompt] = useState(defaultPrompt)

    // ── Manual mode state ───────────────────────────────────────────────────
    const [projectName, setProjectName] = useState('')
    const [projectDesc, setProjectDesc] = useState('')
    const [apps, setApps] = useState<AppEntry[]>([
        { name: '', type_app: 'api', description: '' },
    ])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // ── Handlers ────────────────────────────────────────────────────────────

    const handlePromptSubmit = () => {
        if (!prompt.trim()) return
        startPipeline(prompt.trim())
        navigate('/pipeline')
    }

    const handleManualSubmit = async () => {
        if (!projectName.trim()) {
            setError('Project name is required')
            return
        }
        const validApps = apps.filter((a) => a.name.trim())
        if (validApps.length === 0) {
            setError('Add at least one application with a name')
            return
        }

        setError('')
        setSaving(true)
        try {
            const res: any = await saveProject(orgId, user.id!, {
                name: projectName.trim(),
                description: projectDesc.trim() || null,
                envs: [
                    DambaEnvironmentType.DEV,
                    DambaEnvironmentType.QA,
                    DambaEnvironmentType.STAGING,
                    DambaEnvironmentType.PROD,
                ],
                buildingType: 'manual',
                applications: validApps,
            })
            const project = res?.project ?? res
            if (project) {
                if (res.setting) {
                    user.currentSetting = res.setting
                    setUser(user)
                }
                addProject(project)
                const BACKEND_TYPES = new Set([
                    'api', 'microservice', 'daemon', 'workers', 'cli', 'library',
                ])
                const hasBackend = validApps.some((a) =>
                    BACKEND_TYPES.has(a.type_app),
                )
                startManualPipeline(project.id, hasBackend, project.applications ?? validApps)
                navigate('/manual-pipeline')
            }
        } catch (err: any) {
            setError(err?.message ?? 'Failed to create project')
        } finally {
            setSaving(false)
        }
    }

    const addApp = () => {
        setApps((prev) => [
            ...prev,
            { name: '', type_app: 'api', description: '' },
        ])
    }

    const removeApp = (idx: number) => {
        setApps((prev) => prev.filter((_, i) => i !== idx))
    }

    const updateApp = (idx: number, field: keyof AppEntry, value: string) => {
        setApps((prev) =>
            prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
        )
    }

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="fixed inset-0 z-50 bg-[#0B1120] text-gray-300 flex flex-col overflow-y-auto">
            {/* Header */}
            <Header
                className="border-b border-[#1E293B] !bg-[#0F172A]"
                headerStart={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/home')}
                            className="p-1.5 rounded-lg hover:bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
                        >
                            <HiOutlineChevronLeft />
                        </button>
                        <HeaderLogo />
                        <span className="text-sm font-semibold text-white">
                            New Project
                        </span>
                    </div>
                }
            />

            {/* Content */}
            <div className="flex-1 flex items-start justify-center px-6 py-12">
                <div className="w-full max-w-2xl">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <button
                            onClick={() => setMode('prompt')}
                            className={classNames(
                                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                                mode === 'prompt'
                                    ? 'bg-[#fb732c]/10 text-[#fb732c] border border-[#fb732c]/30'
                                    : 'bg-[#0F172A] text-gray-400 border border-[#1E293B] hover:text-gray-200 hover:border-gray-600',
                            )}
                        >
                            <HiOutlineSparkles />
                            AI Prompt
                        </button>
                        <button
                            onClick={() => setMode('manual')}
                            className={classNames(
                                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                                mode === 'manual'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                    : 'bg-[#0F172A] text-gray-400 border border-[#1E293B] hover:text-gray-200 hover:border-gray-600',
                            )}
                        >
                            <HiOutlinePencilAlt />
                            Manual Setup
                        </button>
                    </div>

                    {/* ── AI Prompt Mode ──────────────────────────────────── */}
                    {mode === 'prompt' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-[#fb732c]/10 flex items-center justify-center mx-auto mb-4">
                                    <HiOutlineSparkles className="text-3xl text-[#fb732c]" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Describe your project
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Our AI will generate the full backend
                                    architecture for you
                                </p>
                            </div>

                            <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl overflow-hidden">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    rows={10}
                                    className="w-full bg-transparent text-sm text-gray-300 font-mono leading-relaxed resize-none p-5 outline-none placeholder-gray-600"
                                    placeholder="Describe the application you want to build..."
                                />

                                <div className="px-5 py-4 border-t border-[#1E293B] flex items-center justify-end">
                                    <button
                                        onClick={handlePromptSubmit}
                                        disabled={!prompt.trim()}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#fb732c] text-white hover:bg-[#e5631f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#fb732c]/20"
                                    >
                                        <HiOutlineSparkles />
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Manual Mode ────────────────────────────────────── */}
                    {mode === 'manual' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                    <HiOutlinePencilAlt className="text-3xl text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Create manually
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Set up your project structure step by step
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Project Info */}
                                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Project
                                    </h3>

                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1.5">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) =>
                                                setProjectName(e.target.value)
                                            }
                                            placeholder="my-awesome-project"
                                            className="w-full bg-[#0B1120] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            value={projectDesc}
                                            onChange={(e) =>
                                                setProjectDesc(e.target.value)
                                            }
                                            rows={3}
                                            placeholder="Brief description of your project..."
                                            className="w-full bg-[#0B1120] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-500 transition-colors resize-none placeholder-gray-600"
                                        />
                                    </div>
                                </div>

                                {/* Applications */}
                                <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Applications
                                        </h3>
                                        <button
                                            onClick={addApp}
                                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            <HiOutlinePlus className="text-sm" />
                                            Add App
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {apps.map((app, idx) => (
                                            <div
                                                key={idx}
                                                className="bg-[#0B1120] border border-[#1E293B] rounded-lg p-4 space-y-3"
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* App name */}
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] text-gray-500 mb-1">
                                                            Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={app.name}
                                                            onChange={(e) =>
                                                                updateApp(
                                                                    idx,
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="my-api"
                                                            className="w-full bg-[#0F172A] border border-[#1E293B] rounded-md px-2.5 py-1.5 text-xs text-gray-300 outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                                                        />
                                                    </div>

                                                    {/* App type */}
                                                    <div className="w-40">
                                                        <label className="block text-[10px] text-gray-500 mb-1">
                                                            Type
                                                        </label>
                                                        <select
                                                            value={app.type_app}
                                                            onChange={(e) =>
                                                                updateApp(
                                                                    idx,
                                                                    'type_app',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full bg-[#0F172A] border border-[#1E293B] rounded-md px-2.5 py-1.5 text-xs text-gray-300 outline-none focus:border-blue-500 transition-colors"
                                                        >
                                                            {APP_TYPES.map(
                                                                (t) => (
                                                                    <option
                                                                        key={
                                                                            t.value
                                                                        }
                                                                        value={
                                                                            t.value
                                                                        }
                                                                    >
                                                                        {
                                                                            t.label
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </div>

                                                    {/* Delete */}
                                                    {apps.length > 1 && (
                                                        <button
                                                            onClick={() =>
                                                                removeApp(idx)
                                                            }
                                                            className="mt-5 p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                                                        >
                                                            <HiOutlineTrash className="text-sm" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* App description */}
                                                <div>
                                                    <label className="block text-[10px] text-gray-500 mb-1">
                                                        Description
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={app.description}
                                                        onChange={(e) =>
                                                            updateApp(
                                                                idx,
                                                                'description',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="What does this app do?"
                                                        className="w-full bg-[#0F172A] border border-[#1E293B] rounded-md px-2.5 py-1.5 text-xs text-gray-300 outline-none focus:border-blue-500 transition-colors placeholder-gray-600"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end">
                                    <button
                                        onClick={handleManualSubmit}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-600/20"
                                    >
                                        {saving
                                            ? 'Creating...'
                                            : 'Create Project'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NewProject
