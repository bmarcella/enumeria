/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useProjectStore, selectSelectedProject } from '@/stores/useProjectStore'
import IDELayout from '@/views/IDE/IDELayout'
import FileExplorer, { type FileNode } from '@/views/IDE/FileExplorer'
import Editor from '@monaco-editor/react'
import { HiOutlineX } from 'react-icons/hi'
import classNames from 'classnames'

// ── Backend app tree ───���────────────────────────────────────────────────────
import useBackendAppView from '@/views/Pages/App/BackendAppView'
import AppTreeExplorer from '@/views/Pages/App/AppTreeExplorer'

// ── Other views ─────────────────────────────────────────────────────────────
import PoliciesView from '@/views/Pages/Policies/PoliciesView'
import Preview from '@/views/IDE/Preview'
import ChatBox from '@/components/view/ChatBox/ChatBox'

// ── Icons ───────────────────────────────────────────────────────────────────
import {
    HiOutlineViewGrid,
    HiOutlineShieldCheck,
    HiOutlineKey,
    HiOutlineEye,
    HiOutlineChat,
    HiOutlineLockClosed,
    HiOutlineFolder,
} from 'react-icons/hi'

const BACKEND_TYPES = new Set([
    'api',
    'microservice',
    'daemon',
    'workers',
    'cli',
    'library',
    'packages',
    'package-entities',
    'package-validators',
    'package-policies-middlewares',
])

const FRONTEND_TYPES = new Set(['ui', 'web', 'mobile'])

type WorkspaceTab =
    | 'app'
    | 'validators'
    | 'policies'
    | 'middlewares'
    | 'preview'
    | 'explorer'

type EditorTab = {
    id: string
    name: string
    content: string
    language: string
}

const LS_KEY = 'workspace-active-tab'

const Workspace = () => {
    const navigate = useNavigate()
    const project = useProjectStore(selectSelectedProject)
    const cApp = useApplicationStore((s) => s.cApp)
    const typeApp: string = (cApp as any)?.type_app ?? ''

    const isBackend = BACKEND_TYPES.has(typeApp)
    const isFrontend = FRONTEND_TYPES.has(typeApp)

    // ── Tab state ───────────────────────────────────────────────────────────
    const defaultTab: WorkspaceTab = isBackend
        ? 'app'
        : isFrontend
          ? 'preview'
          : 'explorer'

    const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => {
        if (typeof window === 'undefined') return defaultTab
        const saved = window.localStorage.getItem(LS_KEY) as WorkspaceTab | null
        return saved ?? defaultTab
    })

    const handleTabChange = (tab: WorkspaceTab) => {
        setActiveTab(tab)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(LS_KEY, tab)
        }
    }

    // ── Backend app tree hook ───────────────────────────────────────────────
    const appView = useBackendAppView()

    // ── File explorer state (for explorer tab) ──────────────────────────────
    const [selectedFileId, setSelectedFileId] = useState<string | undefined>()
    const [editorTabs, setEditorTabs] = useState<EditorTab[]>([])
    const [activeEditorTabId, setActiveEditorTabId] = useState<string | null>(
        null,
    )

    const fileTree = useMemo<FileNode[]>(() => {
        if (!project) return []
        return [
            {
                id: 'src',
                name: 'src',
                type: 'folder',
                children: [
                    {
                        id: 'modules',
                        name: 'modules',
                        type: 'folder',
                        icon: 'module',
                        children: [
                            {
                                id: 'index-ts',
                                name: 'index.ts',
                                type: 'file',
                                icon: 'config',
                                data: {
                                    content: `import Damba from '@Damba/v2';\n\n// ${project.name} entry point\nasync function main() {\n  await Damba.start({ modules: [], AppConfig, express });\n}\n\nmain().catch(console.error);`,
                                    language: 'typescript',
                                },
                            },
                        ],
                    },
                    {
                        id: 'entities',
                        name: 'entities',
                        type: 'folder',
                        icon: 'entity',
                        children: [],
                    },
                ],
            },
            {
                id: 'package-json',
                name: 'package.json',
                type: 'file',
                icon: 'config',
                data: {
                    content: JSON.stringify(
                        { name: project.name, version: '0.1.0', private: true },
                        null,
                        2,
                    ),
                    language: 'json',
                },
            },
        ]
    }, [project])

    const openFile = useCallback(
        (node: FileNode) => {
            if (node.type === 'folder') {
                setSelectedFileId(node.id)
                return
            }
            setSelectedFileId(node.id)
            if (editorTabs.find((t) => t.id === node.id)) {
                setActiveEditorTabId(node.id)
                return
            }
            const newTab: EditorTab = {
                id: node.id,
                name: node.name,
                content: node.data?.content ?? '',
                language: node.data?.language ?? 'typescript',
            }
            setEditorTabs((prev) => [...prev, newTab])
            setActiveEditorTabId(node.id)
        },
        [editorTabs],
    )

    const closeEditorTab = useCallback(
        (id: string) => {
            setEditorTabs((prev) => {
                const next = prev.filter((t) => t.id !== id)
                if (activeEditorTabId === id) {
                    setActiveEditorTabId(
                        next.length > 0 ? next[next.length - 1].id : null,
                    )
                }
                return next
            })
        },
        [activeEditorTabId],
    )

    const activeEditorTab = editorTabs.find((t) => t.id === activeEditorTabId)

    // ── Activity bar items ──────────────────────────────────────────────────
    const commonActivityItems: {
        key: WorkspaceTab
        icon: React.ReactNode
        label: string
    }[] = [
        { key: 'validators', icon: <HiOutlineKey />, label: 'Validators' },
        {
            key: 'policies',
            icon: <HiOutlineShieldCheck />,
            label: 'Policies',
        },
        {
            key: 'middlewares',
            icon: <HiOutlineLockClosed />,
            label: 'Middlewares',
        },
        { key: 'explorer', icon: <HiOutlineFolder />, label: 'Explorer' },
    ]

    const backendActivityItems = [
        {
            key: 'app' as WorkspaceTab,
            icon: <HiOutlineViewGrid />,
            label: 'App',
        },
        ...commonActivityItems,
    ]

    const frontendActivityItems = [
        {
            key: 'preview' as WorkspaceTab,
            icon: <HiOutlineEye />,
            label: 'Preview',
        },
        ...commonActivityItems,
    ]

    const activityItems = isBackend
        ? backendActivityItems
        : isFrontend
          ? frontendActivityItems
          : [
                {
                    key: 'explorer' as WorkspaceTab,
                    icon: <HiOutlineFolder />,
                    label: 'Explorer',
                },
            ]

    // ── Render editor content ─��─────────────────────────────────────────────
    const renderContent = () => {
        switch (activeTab) {
            // Backend: tree-based app view
            case 'app':
                return appView.renderPanel()

            // Common tabs
            case 'validators':
                return (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <HiOutlineKey className="text-4xl text-gray-700 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Validators</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Manage validation schemas for your application.
                            </p>
                        </div>
                    </div>
                )
            case 'policies':
                return (
                    <div className="h-full overflow-y-auto p-4">
                        <PoliciesView />
                    </div>
                )
            case 'middlewares':
                return (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <HiOutlineLockClosed className="text-4xl text-gray-700 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Middlewares</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Manage middleware pipelines for your application.
                            </p>
                        </div>
                    </div>
                )

            // Frontend: preview + chat
            case 'preview':
                return (
                    <div className="flex h-full">
                        <div className="flex-1 flex flex-col min-w-0">
                            <Preview
                                previewUrl={
                                    (cApp as any)?.host
                                        ? `${(cApp as any).host}:${(cApp as any).port || 3000}`
                                        : ''
                                }
                            />
                        </div>
                        <div className="w-[380px] border-l border-[#1E293B] flex flex-col">
                            <div className="px-4 py-3 border-b border-[#1E293B] flex items-center gap-2">
                                <HiOutlineChat className="text-lg text-gray-500" />
                                <span className="text-sm font-medium text-gray-300">
                                    Prompt
                                </span>
                            </div>
                            <div className="flex-1 min-h-0">
                                <ChatBox
                                    messageList={[]}
                                    placeholder="Describe what you want to build..."
                                    onInputChange={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                )

            // Explorer / file editor
            case 'explorer':
            default:
                return (
                    <div className="h-full flex flex-col">
                        {editorTabs.length > 0 && (
                            <div className="h-9 bg-[#161b22] border-b border-[#21262d] flex items-center overflow-x-auto shrink-0">
                                {editorTabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={classNames(
                                            'h-full flex items-center gap-2 px-3 text-xs border-r border-[#21262d] cursor-pointer shrink-0 transition-colors',
                                            tab.id === activeEditorTabId
                                                ? 'bg-[#0d1117] text-white border-t-2 border-t-[#fb732c]'
                                                : 'bg-[#161b22] text-gray-500 hover:text-gray-300 border-t-2 border-t-transparent',
                                        )}
                                        onClick={() =>
                                            setActiveEditorTabId(tab.id)
                                        }
                                    >
                                        <span className="truncate max-w-[120px]">
                                            {tab.name}
                                        </span>
                                        <button
                                            className="p-0.5 rounded hover:bg-[#21262d] text-gray-600 hover:text-gray-300"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                closeEditorTab(tab.id)
                                            }}
                                        >
                                            <HiOutlineX className="text-[10px]" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex-1 min-h-0">
                            {activeEditorTab ? (
                                <Editor
                                    height="100%"
                                    theme="vs-dark"
                                    language={activeEditorTab.language}
                                    value={activeEditorTab.content}
                                    onChange={(value) => {
                                        setEditorTabs((prev) =>
                                            prev.map((t) =>
                                                t.id === activeEditorTab.id
                                                    ? {
                                                          ...t,
                                                          content: value ?? '',
                                                      }
                                                    : t,
                                            ),
                                        )
                                    }}
                                    options={{
                                        minimap: { enabled: true },
                                        fontSize: 13,
                                        fontFamily:
                                            'JetBrains Mono, Monaco, Menlo, monospace',
                                        lineNumbers: 'on',
                                        renderWhitespace: 'selection',
                                        bracketPairColorization: {
                                            enabled: true,
                                        },
                                        scrollBeyondLastLine: false,
                                        padding: { top: 8 },
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>
                )
        }
    }

    // ── Sidebar content ─────────────────────────────────────────────────────
    const renderSidebar = () => {
        switch (activeTab) {
            case 'app':
                return (
                    <AppTreeExplorer
                        tree={appView.tree}
                        selectedId={appView.selectedId}
                        onSelect={appView.handleSelect}
                    />
                )
            case 'explorer':
                return (
                    <FileExplorer
                        tree={fileTree}
                        selectedId={selectedFileId}
                        onSelect={openFile}
                    />
                )
            default:
                return null
        }
    }

    return (
        <IDELayout
            projectName={project?.name ?? 'No Project'}
            activeSidebarTab={activeTab as any}
            onSidebarTabChange={(tab) => handleTabChange(tab as WorkspaceTab)}
            onBack={() => navigate('/home')}
            activityItems={activityItems as any}
            sidebar={renderSidebar()}
            editor={renderContent()}
        />
    )
}

export default Workspace
