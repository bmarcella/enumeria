/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import AppView from './Pages/App/AppView'
import { useApplicationStore } from '@/stores/useApplicationStore'
import DambaEditorView from './Pages/Editor/DambaEditorView'
import OrgView from './Pages/Org/OrgView'
import ProjectView from './Pages/Project/ProjectView'
import SettingView from './Pages/Settings/SettingView'
import SidebarDamba, {
    MenuKey,
    SidebarItem,
    SidebarMenuKey,
} from './components/Layout/SideBarDambaPure'
import {
    HiOutlineViewGrid,
    HiOutlineCode,
    HiOutlineFolder,
    HiOutlineOfficeBuilding,
    HiOutlineCog,
} from 'react-icons/hi'
import MainDamba from './components/Layout/MainDamba'
import Meta from './Meta'

const LS_KEY = 'sidebar_menu_key'

const Home = () => {
    const app = useApplicationStore((s) => s.cApp)
    const [appName, setAppName] = useState<MenuKey>()
    const validKeys = useMemo(
        () =>
            new Set<MenuKey>([
                appName as any,
                ...Object.values(SidebarMenuKey),
            ]),
        [appName],
    )

    const [key, setkey] = useState<string>(() => {
        if (typeof window === 'undefined') return appName
        const saved = window.localStorage.getItem(LS_KEY)
        return saved && validKeys.has(saved) ? saved : (appName as any)
    })

    const items: SidebarItem[] = useMemo(
        () => [
            { key: appName, icon: <HiOutlineViewGrid /> },
            { key: SidebarMenuKey.Editor, icon: <HiOutlineCode /> },
            { key: SidebarMenuKey.Project, icon: <HiOutlineFolder /> },
            {
                key: SidebarMenuKey.Organition,
                icon: <HiOutlineOfficeBuilding />,
            },
            { key: SidebarMenuKey.Setting, icon: <HiOutlineCog /> },
        ],
        [appName, app],
    )
    useEffect(() => {
        const appName = app?.name || 'No Application'
        setAppName(appName)
        setkey(appName)
    }, [app])

    const handleView = (key: string) => {
        key = !key ? app?.name || 'No Application' : key
        setkey(key)
    }

    const renderView = (key: SidebarMenuKey | string) => {
        switch (key) {
            case appName:
                return <AppView />
            case SidebarMenuKey.Editor:
                return <DambaEditorView />
            case SidebarMenuKey.Organition:
                return <OrgView />
            case SidebarMenuKey.Project:
                return <ProjectView />
            case SidebarMenuKey.Setting:
                return <SettingView />
            default:
                return null // or a <NotFound /> / placeholder
        }
    }

    return (
        <>
            <Meta></Meta>
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

export default Home
