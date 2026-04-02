import { useCallback, useMemo, useState } from 'react'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { AppSwitcher } from '@/components/AppSwitcher'
import SidebarDamba, {
    SidebarMenuKey,
    SidebarItem,
} from '@/components/Layout/SideBarDambaPure'
import MainDamba from '@/components/Layout/MainDamba'
import ModulesView from '../Module/ModulesView'
import { ServiceProvider } from '@/providers/ServiceProvider'
import { fetchServicesByModuleId } from '@/services/module'
import ServiceView from '../Service/ServiceView'
import BehaviorView from '../Behavior/BehaviorView'
import PoliciesView from '../Policies/PoliciesView'
import Preview from '@/views/IDE/Preview'
import ChatBox from '@/components/view/ChatBox/ChatBox'
import {
    HiOutlineMenuAlt2,
    HiOutlineCollection,
    HiOutlineChip,
    HiOutlinePuzzle,
    HiOutlineShieldCheck,
    HiOutlineKey,
    HiOutlineEye,
    HiOutlineChat,
    HiOutlineLockClosed,
} from 'react-icons/hi'
import { HiOutlineViewColumns } from 'react-icons/hi2'

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

const LS_KEY = 'workspace-sidebar-key'

const WorkspaceView = () => {
    const cApp = useApplicationStore((s) => s.cApp)
    const typeApp: string = (cApp as any)?.type_app ?? ''

    const isBackend = BACKEND_TYPES.has(typeApp)
    const isFrontend = FRONTEND_TYPES.has(typeApp)

    const defaultKey = isBackend
        ? SidebarMenuKey.Modules
        : isFrontend
          ? SidebarMenuKey.Preview
          : ''

    const [activeKey, setActiveKey] = useState<string>(() => {
        if (typeof window === 'undefined') return defaultKey
        const saved = window.localStorage.getItem(LS_KEY)
        return saved ?? defaultKey
    })

    const handleSelect = (key: string) => {
        setActiveKey(key)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(LS_KEY, key)
        }
    }

    // Common tabs shared by all app types
    const commonItems: SidebarItem[] = useMemo(
        () => [
            {
                key: SidebarMenuKey.Validators,
                title: 'Validators',
                icon: <HiOutlineKey />,
            },
            {
                key: SidebarMenuKey.Policies,
                title: 'Policies',
                icon: <HiOutlineShieldCheck />,
            },
            {
                key: SidebarMenuKey.Middlewares,
                title: 'Middlewares',
                icon: <HiOutlineLockClosed />,
            },
        ],
        [],
    )

    const backendItems: SidebarItem[] = useMemo(
        () => [
            {
                key: SidebarMenuKey.Modules,
                title: 'Modules',
                icon: <HiOutlineMenuAlt2 />,
            },
            {
                key: SidebarMenuKey.Services,
                title: 'Services',
                icon: <HiOutlineCollection />,
            },
            {
                key: SidebarMenuKey.Behaviors,
                title: 'Behaviors',
                icon: <HiOutlineChip />,
            },
            {
                key: SidebarMenuKey.Extras,
                title: 'Extras',
                icon: <HiOutlinePuzzle />,
            },
            ...commonItems,
        ],
        [commonItems],
    )

    const frontendItems: SidebarItem[] = useMemo(
        () => [
            {
                key: SidebarMenuKey.Preview,
                title: 'Preview',
                icon: <HiOutlineEye />,
            },
            ...commonItems,
        ],
        [commonItems],
    )

    const items = isBackend ? backendItems : isFrontend ? frontendItems : []

    const renderBackendView = useCallback(
        (key: string) => {
            switch (key) {
                case SidebarMenuKey.Modules:
                    return <ModulesView goTo={handleSelect} />
                case SidebarMenuKey.Services:
                    return (
                        <ServiceProvider
                            fetchServicesByModuleId={fetchServicesByModuleId}
                        >
                            <ServiceView />
                        </ServiceProvider>
                    )
                case SidebarMenuKey.Behaviors:
                    return <BehaviorView />
                case SidebarMenuKey.Extras:
                    return (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold dark:text-gray-200">
                                Extras
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Manage extras and hooks for your services.
                            </p>
                        </div>
                    )
                case SidebarMenuKey.Validators:
                    return (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold dark:text-gray-200">
                                Validators
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Manage validation schemas for your application.
                            </p>
                        </div>
                    )
                case SidebarMenuKey.Policies:
                    return <PoliciesView />
                case SidebarMenuKey.Middlewares:
                    return (
                        <div className="p-6">
                            <h2 className="text-lg font-semibold dark:text-gray-200">
                                Middlewares
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Manage middleware pipelines for your application.
                            </p>
                        </div>
                    )
                default:
                    return null
            }
        },
        [handleSelect],
    )

    const renderFrontendView = useCallback((key: string) => {
        switch (key) {
            case SidebarMenuKey.Preview:
                return (
                    <div className="flex h-full">
                        {/* Preview panel */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <Preview
                                previewUrl={
                                    (cApp as any)?.host
                                        ? `${(cApp as any).host}:${(cApp as any).port || 3000}`
                                        : ''
                                }
                            />
                        </div>
                        {/* Chat panel */}
                        <div className="w-[380px] border-l border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                                <HiOutlineChat className="text-lg text-gray-500" />
                                <span className="text-sm font-medium dark:text-gray-200">
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
            case SidebarMenuKey.Validators:
                return (
                    <div className="p-6">
                        <h2 className="text-lg font-semibold dark:text-gray-200">
                            Validators
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Manage validation schemas for your application.
                        </p>
                    </div>
                )
            case SidebarMenuKey.Policies:
                return <PoliciesView />
            case SidebarMenuKey.Middlewares:
                return (
                    <div className="p-6">
                        <h2 className="text-lg font-semibold dark:text-gray-200">
                            Middlewares
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Manage middleware pipelines for your application.
                        </p>
                    </div>
                )
            default:
                return null
        }
    }, [cApp])

    // No application selected
    if (!cApp || (!isBackend && !isFrontend)) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="text-center">
                    <HiOutlineViewColumns className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold dark:text-gray-200">
                        Select an Application
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                        Choose an application to open its workspace. The view
                        adapts based on the application type.
                    </p>
                </div>
                <div className="w-64">
                    <AppSwitcher />
                </div>
            </div>
        )
    }

    return (
        <MainDamba
            sidebar={
                <SidebarDamba
                    items={items}
                    activeKey={activeKey}
                    onSelect={handleSelect}
                />
            }
            content={
                isBackend
                    ? renderBackendView(activeKey)
                    : renderFrontendView(activeKey)
            }
        />
    )
}

export default WorkspaceView
