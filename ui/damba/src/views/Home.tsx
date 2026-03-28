import MainDambaMaster from '@/components/Layout/MainDambaMaster'
import {
    HomeSidebarMenuKey,
    SidebarMenuKey,
} from '@/components/Layout/SideBarDambaPure'
import { ProjectList } from './Pages/Project/ProjectList'
import { HiCodeBracket, HiOutlineCog } from 'react-icons/hi2'
import {
    HiCreditCard,
    HiHome,
    HiShoppingBag,
    HiLightningBolt,
    HiOutlineDatabase,
    HiOutlineClipboardList,
    HiOutlineSwitchHorizontal,
} from 'react-icons/hi'
import DeveloperView from './Pages/Developer/DeveloperView'
import WorkspaceView from './Pages/Workspace/WorkspaceView'
import DataModelerView from './Pages/DataModeler/DataModelerView'
import UseCasesView from './Pages/UseCases/UseCasesView'

const sidebarsConfig = {
    items: [
        { key: HomeSidebarMenuKey.Home, icon: <HiHome /> },
        {
            key: HomeSidebarMenuKey.Workspace,
            icon: <HiOutlineSwitchHorizontal />,
        },
        { key: HomeSidebarMenuKey.DataModeler, icon: <HiOutlineDatabase /> },
        { key: HomeSidebarMenuKey.UseCases, icon: <HiOutlineClipboardList /> },
        { key: HomeSidebarMenuKey.Developer, icon: <HiCodeBracket /> },
        { key: HomeSidebarMenuKey.MarketPlace, icon: <HiShoppingBag /> },
        { key: HomeSidebarMenuKey.Plans, icon: <HiLightningBolt /> },
        { key: HomeSidebarMenuKey.Billing, icon: <HiCreditCard /> },
        { key: HomeSidebarMenuKey.Settings, icon: <HiOutlineCog /> },
    ],
    initialDefaultKey: HomeSidebarMenuKey.Home,
    MenuKeys: HomeSidebarMenuKey,
    storeKeyName: 'home-sidebar-key',
}

const renderView = (activeKey: SidebarMenuKey | string) => {
    switch (activeKey) {
        case HomeSidebarMenuKey.Home:
            return (
                <div className="p-4 h-full overflow-y-auto">
                    <ProjectList />
                </div>
            )
        case HomeSidebarMenuKey.Workspace:
            return (
                <div className="h-full overflow-y-auto">
                    <WorkspaceView />
                </div>
            )
        case HomeSidebarMenuKey.DataModeler:
            return <DataModelerView />
        case HomeSidebarMenuKey.UseCases:
            return <UseCasesView />
        case HomeSidebarMenuKey.Developer:
            return (
                <div className="p-4 h-full overflow-y-auto">
                    <DeveloperView />
                </div>
            )
        default:
            return (
                <div className="p-4 h-full overflow-y-auto">
                    View not implemented yet for {activeKey}
                </div>
            )
    }
}

const Home = () => {
    return <MainDambaMaster sidebars={sidebarsConfig} content={renderView} />
}

export default Home
