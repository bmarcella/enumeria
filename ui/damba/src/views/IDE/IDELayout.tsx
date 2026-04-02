/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, type ReactNode } from 'react'
import {
    HiOutlineFolder,
    HiOutlineDatabase,
    HiOutlineCube,
    HiOutlineCode,
    HiOutlineTerminal,
    HiOutlineCog,
    HiOutlineChevronLeft,
    HiOutlineSearch,
    HiOutlineLightningBolt,
} from 'react-icons/hi'
import classNames from 'classnames'
import Header from '@/components/template/Header'
import HeaderLogo from '@/components/template/HeaderLogo'
import OrgSwitcher from './OrgSwitcher'
import AppSwitcher from './AppSwitcher'
import EnvSwitcher from './EnvSwitcher'

// ─── Types ──────────────────────────────────────────────────────────────────

type SidebarTab = string

type ActivityItem = { key: string; icon: ReactNode; label: string }

type IDELayoutProps = {
    projectName?: string
    sidebar?: ReactNode
    editor?: ReactNode
    terminal?: ReactNode
    statusBar?: ReactNode
    activeSidebarTab?: SidebarTab
    onSidebarTabChange?: (tab: SidebarTab) => void
    onBack?: () => void
    activityItems?: ActivityItem[]
}

// ─── Default Activity Bar (leftmost icon strip) ─────────────────────────────

const defaultActivityItems: ActivityItem[] = [
    { key: 'explorer', icon: <HiOutlineFolder />, label: 'Explorer' },
    { key: 'entities', icon: <HiOutlineDatabase />, label: 'Data Models' },
    { key: 'search', icon: <HiOutlineSearch />, label: 'Search' },
    { key: 'extensions', icon: <HiOutlineLightningBolt />, label: 'Extensions' },
    { key: 'settings', icon: <HiOutlineCog />, label: 'Settings' },
]

// ─── Component ──────────────────────────────────────────────────────────────

const IDELayout = ({
    projectName = 'Untitled Project',
    sidebar,
    editor,
    terminal,
    statusBar,
    activeSidebarTab = 'explorer',
    onSidebarTabChange,
    onBack,
    activityItems = defaultActivityItems,
}: IDELayoutProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [terminalOpen, setTerminalOpen] = useState(false)
    const [terminalHeight, setTerminalHeight] = useState(200)

    const toggleSidebar = useCallback(
        (tab: SidebarTab) => {
            if (activeSidebarTab === tab && sidebarOpen) {
                setSidebarOpen(false)
            } else {
                setSidebarOpen(true)
                onSidebarTabChange?.(tab)
            }
        },
        [activeSidebarTab, sidebarOpen, onSidebarTabChange],
    )

    return (
        <div className="fixed inset-0 flex flex-col bg-[#0B1120] text-gray-300 overflow-hidden select-none z-50">
            {/* ── Title Bar ──────────────────────────────────────────── */}
            <Header
                className="border-b border-[#1E293B] !bg-[#0F172A] shrink-0 z-50"
                wrapperClass="!h-9"
                headerStart={
                    <div className="flex items-center gap-2">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-1 rounded hover:bg-[#1E293B] text-gray-400 hover:text-white transition-colors"
                            >
                                <HiOutlineChevronLeft className="text-sm" />
                            </button>
                        )}
                        <HeaderLogo />
                        <span className="w-px h-4 bg-[#1E293B]" />
                        <OrgSwitcher />
                        <span className="w-px h-4 bg-[#1E293B]" />
                        <span className="text-xs font-semibold text-gray-300 truncate max-w-[160px]">
                            {projectName}
                        </span>
                        <span className="w-px h-4 bg-[#1E293B]" />
                        <AppSwitcher />
                        <span className="w-px h-4 bg-[#1E293B]" />
                        <EnvSwitcher />
                    </div>
                }
                headerEnd={
                    <button
                        onClick={() => setTerminalOpen(!terminalOpen)}
                        className={classNames(
                            'p-1.5 rounded text-xs transition-colors',
                            terminalOpen
                                ? 'bg-[#1E293B] text-white'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-[#1E293B]',
                        )}
                        title="Toggle Terminal"
                    >
                        <HiOutlineTerminal />
                    </button>
                }
            />

            {/* ── Main Area ──────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0">
                {/* Activity Bar (icon strip) */}
                <div className="w-12 bg-[#0B1120] border-r border-[#1E293B] flex flex-col items-center py-2 gap-1 shrink-0">
                    {activityItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => toggleSidebar(item.key)}
                            className={classNames(
                                'w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-all',
                                activeSidebarTab === item.key && sidebarOpen
                                    ? 'text-white bg-[#1E293B] border-l-2 border-[#fb732c]'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#0F172A]',
                            )}
                            title={item.label}
                        >
                            {item.icon}
                        </button>
                    ))}
                </div>

                {/* Sidebar Panel */}
                <div
                    className={classNames(
                        'bg-[#0B1120] border-r border-[#1E293B] flex flex-col shrink-0 transition-all duration-200 overflow-hidden',
                        sidebarOpen ? 'w-64' : 'w-0',
                    )}
                >
                    {sidebarOpen && (
                        <>
                            <div className="h-9 px-3 flex items-center border-b border-[#1E293B] shrink-0">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {activityItems.find((i) => i.key === activeSidebarTab)?.label ?? 'Explorer'}
                                </span>
                            </div>
                            <div className="flex-1 min-h-0 overflow-y-auto">
                                {sidebar}
                            </div>
                        </>
                    )}
                </div>

                {/* Editor + Terminal */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {/* Editor area */}
                    <div className="flex-1 min-h-0 bg-[#0B1120]">
                        {editor ?? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center">
                                    <HiOutlineCode className="text-4xl text-gray-700 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600">Select a file to start editing</p>
                                    <p className="text-xs text-gray-700 mt-1">
                                        Use the explorer to browse your project
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Terminal panel */}
                    {terminalOpen && (
                        <div
                            className="border-t border-[#1E293B] bg-[#0B1120] shrink-0 flex flex-col"
                            style={{ height: terminalHeight }}
                        >
                            <div className="h-8 px-3 flex items-center justify-between border-b border-[#1E293B] bg-[#0F172A] shrink-0">
                                <div className="flex items-center gap-2">
                                    <HiOutlineTerminal className="text-xs text-gray-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        Terminal
                                    </span>
                                </div>
                                <button
                                    onClick={() => setTerminalOpen(false)}
                                    className="text-gray-600 hover:text-gray-300 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 min-h-0 overflow-y-auto p-3 font-mono text-xs text-gray-400">
                                {terminal ?? (
                                    <div>
                                        <span className="text-[#fb732c]">$</span> Ready
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Status Bar ─────────────────────────────────────────── */}
            <div className="h-6 bg-[#0F172A] border-t border-[#1E293B] flex items-center justify-between px-3 shrink-0">
                {statusBar ?? (
                    <>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Connected
                            </span>
                            <span>Damba v2</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span>TypeScript</span>
                            <span>UTF-8</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default IDELayout
