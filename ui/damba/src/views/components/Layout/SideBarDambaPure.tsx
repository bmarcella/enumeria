/* eslint-disable @typescript-eslint/no-explicit-any */
import Menu from '@/components/ui/Menu'
import type { ReactNode } from 'react'

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
    key: any
    label?: string
    title?: string
    icon?: ReactNode
}

interface Props {
    items: SidebarItem[]
    activeKey: any
    onSelect: (key: any) => void
}
const SidebarDamba = ({ items, activeKey, onSelect }: Props) => {
    return (
        <div className="w-full">
            <Menu
                defaultActiveKeys={[activeKey]} // if not supported by your Menu, use defaultActiveKeys={[activeKey]}
                onSelect={(e: any) => onSelect(String(e))}
            >
                {items.map((item, index) => (
                    <Menu.MenuItem
                        key={item.key + '_' + index}
                        eventKey={item.key}
                    >
                        <div
                            className="flex items-center gap-1"
                            title={item.title}
                        >
                            {item.icon ? (
                                <span className="text-2xl">{item.icon}</span>
                            ) : null}
                            <span>{item.label}</span>
                        </div>
                    </Menu.MenuItem>
                ))}
            </Menu>
        </div>
    )
}

export default SidebarDamba
