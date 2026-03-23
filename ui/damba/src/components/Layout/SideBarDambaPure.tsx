import type { ReactNode } from 'react';

export enum AgentSidebarMenuKey {
    Agents = 'Agents',
    CreateAgent = 'CreateAgent',
}

export enum RunnableSidebarMenuKey {
    Runnable = 'Runnable',
    CreateRunnable = 'CreateRunnable',
}

export enum ToolSidebarMenuKey {
    Tool = 'Tool',
    CreateTool = 'CreateTool',
}

export enum HomeSidebarMenuKey {
    Home = 'Home',
    Workspace = 'Workspace',
    DataModeler = 'DataModeler',
    UseCases = 'UseCases',
    Developer = 'Developer',
    BD = 'BD',
    MarketPlace = 'MarketPlace',
    Settings = 'Settings',
    Plans = 'Plans',
    Billing = 'Billing',
}

export enum SidebarMenuKey {
    Editor = 'Editor',
    Project = 'Project',
    Organition = 'Organition',
    Setting = 'Setting',
    Services = 'Services',
    Middlewares = 'Middlewares',
    Policies = 'Policies',
    Behaviors = 'Behaviors',
    Entities = 'Entities',
}

export type MenuKey = SidebarMenuKey | string

export type SidebarItem = {
    key: string
    label?: string
    title?: string
    icon?: ReactNode
}

interface Props {
    items: SidebarItem[]
    activeKey: string
    onSelect: (key: string) => void
}

const SidebarDamba = ({ items, activeKey, onSelect }: Props) => {
    return (
        <nav className="w-full py-2 flex flex-col gap-1 px-2">
            {items.map((item, index) => {
                const isActive = activeKey === item.key
                return (
                    <button
                        key={item.key + '_' + index}
                        title={item.title || item.label}
                        onClick={() => onSelect(item.key)}
                        className={`w-full group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 outline-none
                            ${
                                isActive
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                    >
                        {item.icon && (
                            <span
                                className={`text-xl flex-shrink-0 transition-colors duration-200 ${
                                    isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                                }`}
                            >
                                {item.icon}
                            </span>
                        )}
                        {item.label && <span className="truncate">{item.label}</span>}
                    </button>
                )
            })}
        </nav>
    )
}

export default SidebarDamba
