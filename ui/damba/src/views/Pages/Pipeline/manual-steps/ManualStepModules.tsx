/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCube } from 'react-icons/hi'
import { saveModule } from '@/services/module'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useOrganizationId } from '@/utils/hooks/useOrganization'
import { useManualPipelineStore } from '@/stores/useManualPipelineStore'

type ModuleEntry = { name: string; description: string; saved?: boolean; id?: string }

const ManualStepModules = () => {
    const cApp = useApplicationStore((s) => s.cApp)
    const orgId = useOrganizationId()
    const projectId = useManualPipelineStore((s) => s.projectId)
    const [modules, setModules] = useState<ModuleEntry[]>([
        { name: '', description: '' },
    ])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const addModule = () => {
        setModules((prev) => [...prev, { name: '', description: '' }])
    }

    const removeModule = (idx: number) => {
        setModules((prev) => prev.filter((_, i) => i !== idx))
    }

    const updateModule = (idx: number, field: keyof ModuleEntry, value: string) => {
        setModules((prev) =>
            prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
        )
    }

    const handleSaveAll = async () => {
        const toSave = modules.filter((m) => m.name.trim() && !m.saved)
        if (toSave.length === 0) return

        setSaving(true)
        setError('')

        try {
            for (let i = 0; i < modules.length; i++) {
                const m = modules[i]
                if (!m.name.trim() || m.saved) continue

                const res: any = await saveModule({
                    name: m.name.trim(),
                    description: m.description.trim() || null,
                    applicationId: cApp?.id,
                    orgId,
                    projId: projectId,
                })
                const saved = res?.module ?? res
                setModules((prev) =>
                    prev.map((mod, j) =>
                        j === i ? { ...mod, saved: true, id: saved?.id } : mod,
                    ),
                )
            }
        } catch (err: any) {
            setError(err?.message ?? 'Failed to save modules')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create the modules for your application. Each module groups related services.
            </p>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="space-y-3 mb-4">
                {modules.map((mod, idx) => (
                    <div
                        key={idx}
                        className={`border rounded-lg p-4 flex items-start gap-3 ${
                            mod.saved
                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30'
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        <div className="w-9 h-9 rounded-lg bg-[#fb732c]/10 flex items-center justify-center shrink-0 mt-1">
                            <HiOutlineCube className="text-[#fb732c]" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                value={mod.name}
                                onChange={(e) => updateModule(idx, 'name', e.target.value)}
                                placeholder="Module name"
                                disabled={mod.saved}
                                className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm dark:text-gray-200 outline-none focus:border-blue-500 disabled:opacity-60 placeholder-gray-400"
                            />
                            <input
                                type="text"
                                value={mod.description}
                                onChange={(e) => updateModule(idx, 'description', e.target.value)}
                                placeholder="Description (optional)"
                                disabled={mod.saved}
                                className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-xs dark:text-gray-400 outline-none focus:border-blue-500 disabled:opacity-60 placeholder-gray-400"
                            />
                        </div>
                        {!mod.saved && modules.length > 1 && (
                            <button
                                onClick={() => removeModule(idx)}
                                className="mt-1 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <HiOutlineTrash className="text-sm" />
                            </button>
                        )}
                        {mod.saved && (
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-2">
                                Saved
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={addModule}
                    className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                >
                    <HiOutlinePlus /> Add Module
                </button>
                <button
                    onClick={handleSaveAll}
                    disabled={saving || modules.every((m) => m.saved || !m.name.trim())}
                    className="ml-auto px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
                >
                    {saving ? 'Saving...' : 'Save Modules'}
                </button>
            </div>
        </div>
    )
}

export default ManualStepModules
