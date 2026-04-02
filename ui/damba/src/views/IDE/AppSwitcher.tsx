/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react'
import {
    HiOutlineCube,
    HiOutlineChevronDown,
    HiOutlineCheck,
} from 'react-icons/hi'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useSessionUser } from '@/stores/authStore'
import classNames from 'classnames'

const typeColors: Record<string, { bg: string; text: string }> = {
    api: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    microservice: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    ui: { bg: 'bg-green-500/20', text: 'text-green-400' },
}

const defaultColor = { bg: 'bg-gray-500/20', text: 'text-gray-400' }

const AppSwitcher = () => {
    const applications = useApplicationStore((s) => s.applications)
    const currentApp = useApplicationStore((s) => s.cApp)
    const setApplication = useApplicationStore((s) => s.setApplication)
    const setApplicationById = useApplicationStore((s) => s.setApplicationById)
    const user = useSessionUser((s) => s.user)
    const setUser = useSessionUser((s) => s.setUser)
    const setSetting = useSessionUser((s) => s.setSetting)
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (app: any) => {
        setApplication(app)
        setApplicationById(app.id)
        setUser({
            ...user,
            currentSetting: {
                ...user.currentSetting,
                appId: app.id,
                moduleId: '',
                servId: '',
            } as any,
        })
        setTimeout(() => setSetting(), 0)
        setOpen(false)
    }

    const displayName = currentApp?.name ?? 'Select App'
    const currentType = (currentApp as any)?.type_app ?? ''
    const color = typeColors[currentType] ?? defaultColor

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#1E293B] transition-colors"
            >
                <div className={classNames('w-5 h-5 rounded flex items-center justify-center', color.bg)}>
                    <HiOutlineCube className={classNames('text-[10px]', color.text)} />
                </div>
                <span className="text-xs font-medium text-gray-300 max-w-[120px] truncate">
                    {displayName}
                </span>
                <HiOutlineChevronDown
                    className={classNames(
                        'text-[10px] text-gray-500 transition-transform',
                        open && 'rotate-180',
                    )}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#0F172A] border border-[#1E293B] rounded-lg shadow-xl z-[100] overflow-hidden">
                    <div className="px-3 py-2 border-b border-[#1E293B]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Applications
                        </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                        {applications.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-600">
                                No applications
                            </div>
                        ) : (
                            applications.map((app: any) => {
                                const isSelected = app.id === currentApp?.id
                                const appColor = typeColors[app.type_app] ?? defaultColor
                                return (
                                    <button
                                        key={app.id}
                                        onClick={() => handleSelect(app)}
                                        className={classNames(
                                            'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                                            isSelected
                                                ? 'bg-[#fb732c]/10 text-white'
                                                : 'text-gray-400 hover:bg-[#1E293B] hover:text-gray-200',
                                        )}
                                    >
                                        <div className={classNames('w-6 h-6 rounded flex items-center justify-center', appColor.bg)}>
                                            <HiOutlineCube className={classNames('text-xs', appColor.text)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-medium truncate block">
                                                {app.name}
                                            </span>
                                            <span className="text-[10px] text-gray-600 uppercase">
                                                {app.type_app}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <HiOutlineCheck className="text-[#fb732c] text-sm shrink-0" />
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AppSwitcher
