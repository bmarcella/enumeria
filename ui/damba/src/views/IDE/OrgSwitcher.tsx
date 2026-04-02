/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react'
import {
    HiOutlineOfficeBuilding,
    HiOutlineChevronDown,
    HiOutlineCheck,
    HiOutlinePlus,
} from 'react-icons/hi'
import {
    useOrganizationStore,
    selectOrganizations,
    selectSelectedOrganization,
} from '@/stores/useOrganizationStore'
import { useSessionUser } from '@/stores/authStore'
import classNames from 'classnames'

const OrgSwitcher = () => {
    const organizations = useOrganizationStore(selectOrganizations)
    const selectedOrg = useOrganizationStore(selectSelectedOrganization)
    const setOrganization = useOrganizationStore((s) => s.setOrganization)
    const user = useSessionUser((s) => s.user)
    const setUser = useSessionUser((s) => s.setUser)
    const setSetting = useSessionUser((s) => s.setSetting)
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const displayName = selectedOrg?.name
        || [user.firstName, user.lastName].filter(Boolean).join(' ')
        || user.email
        || 'Select Org'

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (orgId: string) => {
        setOrganization(orgId)
        setUser({
            ...user,
            currentSetting: {
                ...user.currentSetting,
                orgId,
                projId: '',
                moduleId: '',
                servId: '',
                env: undefined,
            } as any,
        })
        setTimeout(() => setSetting(), 0)
        setOpen(false)
    }

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#1E293B] transition-colors"
            >
                <div className="w-6 h-6 rounded bg-[#1E293B] flex items-center justify-center">
                    <HiOutlineOfficeBuilding className="text-xs text-[#fb732c]" />
                </div>
                <span className="text-xs font-medium text-gray-300 max-w-[140px] truncate">
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
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#0F172A] border border-[#1E293B] rounded-lg shadow-xl z-[100] overflow-hidden">
                    <div className="px-3 py-2 border-b border-[#1E293B]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Organizations
                        </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                        {organizations.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-600">
                                No organizations
                            </div>
                        ) : (
                            organizations.map((org: any) => {
                                const isSelected = org.id === selectedOrg?.id
                                return (
                                    <button
                                        key={org.id}
                                        onClick={() => handleSelect(org.id)}
                                        className={classNames(
                                            'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                                            isSelected
                                                ? 'bg-[#fb732c]/10 text-white'
                                                : 'text-gray-400 hover:bg-[#1E293B] hover:text-gray-200',
                                        )}
                                    >
                                        <div
                                            className={classNames(
                                                'w-7 h-7 rounded flex items-center justify-center text-xs font-bold',
                                                isSelected
                                                    ? 'bg-[#fb732c]/20 text-[#fb732c]'
                                                    : 'bg-[#1E293B] text-gray-500',
                                            )}
                                        >
                                            {(org.name ?? 'O').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-medium truncate block">
                                                {org.name}
                                            </span>
                                            {org.slug && (
                                                <span className="text-[10px] text-gray-600 truncate block">
                                                    {org.slug}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <HiOutlineCheck className="text-[#fb732c] text-sm shrink-0" />
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>

                    <div className="border-t border-[#1E293B]">
                        <button
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-500 hover:text-[#fb732c] hover:bg-[#1E293B] transition-colors"
                        >
                            <HiOutlinePlus className="text-sm" />
                            New Organization
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrgSwitcher
