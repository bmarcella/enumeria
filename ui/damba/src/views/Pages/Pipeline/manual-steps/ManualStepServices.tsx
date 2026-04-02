/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCollection } from 'react-icons/hi'
import { saveService } from '@/services/Service'
import { fetchModulesByAppId } from '@/services/Application'
import { useApplicationStore } from '@/stores/useApplicationStore'

type ServiceEntry = { name: string; description: string; moduleId: string; saved?: boolean }

const ManualStepServices = () => {
    const cApp = useApplicationStore((s) => s.cApp)
    const [modules, setModules] = useState<any[]>([])
    const [services, setServices] = useState<ServiceEntry[]>([])
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!cApp?.id) return
        fetchModulesByAppId(cApp.id)
            .then((res: any) => {
                const list = res?.data ?? res ?? []
                setModules(Array.isArray(list) ? list : [])
                if (Array.isArray(list) && list.length > 0 && services.length === 0) {
                    setServices([{ name: '', description: '', moduleId: list[0].id }])
                }
            })
            .catch(() => setModules([]))
    }, [cApp?.id])

    const addService = () => {
        setServices((prev) => [
            ...prev,
            { name: '', description: '', moduleId: modules[0]?.id ?? '' },
        ])
    }

    const removeService = (idx: number) => {
        setServices((prev) => prev.filter((_, i) => i !== idx))
    }

    const updateService = (idx: number, field: keyof ServiceEntry, value: string) => {
        setServices((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
        )
    }

    const handleSaveAll = async () => {
        const toSave = services.filter((s) => s.name.trim() && !s.saved)
        if (toSave.length === 0) return

        setSaving(true)
        setError('')

        try {
            for (let i = 0; i < services.length; i++) {
                const s = services[i]
                if (!s.name.trim() || s.saved) continue

                await saveService({
                    name: s.name.trim(),
                    description: s.description.trim() || null,
                    moduleId: s.moduleId,
                    appId: cApp?.id,
                })
                setServices((prev) =>
                    prev.map((svc, j) => (j === i ? { ...svc, saved: true } : svc)),
                )
            }
        } catch (err: any) {
            setError(err?.message ?? 'Failed to save services')
        } finally {
            setSaving(false)
        }
    }

    if (modules.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No modules found. Go back and create modules first.</p>
            </div>
        )
    }

    return (
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Create services for each module. A service defines a set of routes and behaviors.
            </p>

            {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="space-y-3 mb-4">
                {services.map((svc, idx) => (
                    <div
                        key={idx}
                        className={`border rounded-lg p-4 space-y-2 ${
                            svc.saved
                                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30'
                                : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                                <HiOutlineCollection className="text-blue-400" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={svc.name}
                                        onChange={(e) => updateService(idx, 'name', e.target.value)}
                                        placeholder="Service name"
                                        disabled={svc.saved}
                                        className="flex-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm dark:text-gray-200 outline-none focus:border-blue-500 disabled:opacity-60 placeholder-gray-400"
                                    />
                                    <select
                                        value={svc.moduleId}
                                        onChange={(e) => updateService(idx, 'moduleId', e.target.value)}
                                        disabled={svc.saved}
                                        className="w-40 bg-transparent border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1.5 text-xs dark:text-gray-300 outline-none focus:border-blue-500 disabled:opacity-60"
                                    >
                                        {modules.map((m: any) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    value={svc.description}
                                    onChange={(e) => updateService(idx, 'description', e.target.value)}
                                    placeholder="Description (optional)"
                                    disabled={svc.saved}
                                    className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded-md px-3 py-1.5 text-xs dark:text-gray-400 outline-none focus:border-blue-500 disabled:opacity-60 placeholder-gray-400"
                                />
                            </div>
                            {!svc.saved && services.length > 1 && (
                                <button onClick={() => removeService(idx)} className="mt-1 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors">
                                    <HiOutlineTrash className="text-sm" />
                                </button>
                            )}
                            {svc.saved && (
                                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-2">Saved</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <button onClick={addService} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors">
                    <HiOutlinePlus /> Add Service
                </button>
                <button
                    onClick={handleSaveAll}
                    disabled={saving || services.every((s) => s.saved || !s.name.trim())}
                    className="ml-auto px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
                >
                    {saving ? 'Saving...' : 'Save Services'}
                </button>
            </div>
        </div>
    )
}

export default ManualStepServices
