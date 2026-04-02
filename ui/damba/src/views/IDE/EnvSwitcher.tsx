/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react'
import { HiOutlineChevronDown, HiOutlineCheck } from 'react-icons/hi'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useSessionUser } from '@/stores/authStore'
import classNames from 'classnames'

const envConfig: Record<string, { label: string; color: string; dot: string }> = {
    dev: { label: 'DEV', color: 'text-green-400', dot: 'bg-green-400' },
    qa: { label: 'QA', color: 'text-blue-400', dot: 'bg-blue-400' },
    staging: { label: 'STAGING', color: 'text-amber-400', dot: 'bg-amber-400' },
    prod: { label: 'PROD', color: 'text-red-400', dot: 'bg-red-400' },
}

const allEnvs = ['dev', 'qa', 'staging', 'prod']

const EnvSwitcher = () => {
    const currentEnv = useApplicationStore((s) => s.env)
    const setEnv = useApplicationStore((s) => s.setEnv)
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

    const handleSelect = (env: string) => {
        setEnv(env as any)
        setUser({
            ...user,
            currentSetting: {
                ...user.currentSetting,
                env,
            } as any,
        })
        setTimeout(() => setSetting(), 0)
        setOpen(false)
    }

    const current = envConfig[currentEnv ?? 'dev'] ?? envConfig.dev

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#1E293B] transition-colors"
            >
                <span className={classNames('w-2 h-2 rounded-full', current.dot)} />
                <span className={classNames('text-[10px] font-bold tracking-wide', current.color)}>
                    {current.label}
                </span>
                <HiOutlineChevronDown
                    className={classNames(
                        'text-[10px] text-gray-500 transition-transform',
                        open && 'rotate-180',
                    )}
                />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-[#0F172A] border border-[#1E293B] rounded-lg shadow-xl z-[100] overflow-hidden">
                    <div className="px-3 py-2 border-b border-[#1E293B]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Environment
                        </span>
                    </div>
                    <div className="py-1">
                        {allEnvs.map((env) => {
                            const cfg = envConfig[env]
                            const isSelected = (currentEnv ?? 'dev') === env
                            return (
                                <button
                                    key={env}
                                    onClick={() => handleSelect(env)}
                                    className={classNames(
                                        'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                                        isSelected
                                            ? 'bg-[#fb732c]/10 text-white'
                                            : 'text-gray-400 hover:bg-[#1E293B] hover:text-gray-200',
                                    )}
                                >
                                    <span className={classNames('w-2 h-2 rounded-full', cfg.dot)} />
                                    <span className={classNames('text-xs font-bold tracking-wide flex-1', cfg.color)}>
                                        {cfg.label}
                                    </span>
                                    {isSelected && (
                                        <HiOutlineCheck className="text-[#fb732c] text-sm shrink-0" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default EnvSwitcher
