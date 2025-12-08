/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppServiceStore } from '@/stores/ServiceStore'
import ShowServices from './ShowServices'

import {
    HiOutlineChip,
    HiOutlineCog,
    HiOutlineCollection,
    HiOutlinePuzzle,
    HiOutlineShieldCheck,
} from 'react-icons/hi'
import { useCallback, useEffect, useMemo, useState } from 'react'
import SidebarDamba, {
    MenuKey,
    SidebarItem,
    SidebarMenuKey,
} from '../components/Layout/SideBarDambaPure'
import EntityView from './EntityView'
import BehaviorView from './BehaviorView'
import PoliciesView from './PoliciesView'
import ServiceSettingView from './ServiceSettingView'
import MainDamba from '../components/Layout/MainDamba'

const LS_KEY = 'sidebar_menu_key_services'

function ServiceView() {
    const service = useAppServiceStore((s) => s.service)
    const [appName, setAppName] = useState<MenuKey>()
    useEffect(() => {
        const appName = service?.name || 'Service'
        setAppName(appName)
        if (!key) setkey(appName)
    }, [service])

    const [key, setkey] = useState<string>(() => {
        if (typeof window === 'undefined') return appName
        const saved = window.localStorage.getItem(LS_KEY)
        return saved ? saved : (appName as any)
    })

    const items: SidebarItem[] = useMemo(
        () => [
            { key: appName, title: 'Entities', icon: <HiOutlinePuzzle /> },
            {
                key: SidebarMenuKey.Behaviors,
                title: SidebarMenuKey.Behaviors,
                icon: <HiOutlineChip />,
            },
            {
                key: SidebarMenuKey.Policies,
                title: SidebarMenuKey.Policies,
                icon: <HiOutlineShieldCheck />,
            },
            {
                key: SidebarMenuKey.Services,
                title: SidebarMenuKey.Services,
                icon: <HiOutlineCollection />,
            },
            {
                key: SidebarMenuKey.Setting,
                title: 'Setting',
                icon: <HiOutlineCog />,
            },
        ],
        [appName],
    )

    const handleView = (key: string) => {
        key = !key ? service?.name || 'Service' : key
        setkey(key)
        if (typeof window != 'undefined')
            window.localStorage.setItem(LS_KEY, key)
    }

    const renderView = useCallback(
        (key: SidebarMenuKey | string) => {
            switch (key) {
                case appName:
                    return <EntityView />

                case SidebarMenuKey.Behaviors:
                    return <BehaviorView />

                case SidebarMenuKey.Services:
                    return <ShowServices goTo={handleView} />

                case SidebarMenuKey.Policies:
                    return <PoliciesView />

                case SidebarMenuKey.Setting:
                    return <ServiceSettingView />

                default:
                    return null
            }
        },
        [appName, setkey],
    )

    return (
        <>
            <MainDamba
                sidebar={
                    <SidebarDamba
                        items={items}
                        activeKey={key}
                        onSelect={handleView}
                    />
                }
                content={renderView(key)}
            ></MainDamba>
        </>
    )
}

export default ServiceView
