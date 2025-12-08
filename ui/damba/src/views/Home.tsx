/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import AppView from './Pages/AppView'
import { useApplicationStore } from '@/stores/useApplicationStore'
import DambaEditorView from './Pages/DambaEditorView'
import OrgView from './Pages/OrgView'
import ProjectView from './Pages/ProjectView'
import SettingView from './Pages/SettingView'
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

    // const items: SidebarItem[] = useMemo(()=> [
    //   { key: appName, label: appName, icon: <HiOutlineViewGrid /> },
    //   { key: SidebarMenuKey.Editor, label: SidebarMenuKey.Editor, icon: <HiOutlineCode /> },
    //   { key: SidebarMenuKey.Project, label: SidebarMenuKey.Project, icon: <HiOutlineFolder /> },
    //   { key: SidebarMenuKey.Organition, label: SidebarMenuKey.Organition, icon: <HiOutlineOfficeBuilding /> },
    //   { key: SidebarMenuKey.Setting, label: SidebarMenuKey.Setting, icon: <HiOutlineCog /> },
    // ], [appName]);
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
        [appName],
    )
    useEffect(() => {
        const appName = app?.name || 'Application'
        setAppName(appName)
        setkey(appName)
    }, [app])

    const handleView = (key: string) => {
        key = !key ? app?.name || 'Application' : key
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
