import MainDambaMaster from "@/components/Layout/MainDambaMaster"
import { HomeSidebarMenuKey, SidebarMenuKey } from "@/components/Layout/SideBarDambaPure"
import { ProjectList } from "./Pages/Project/ProjectList"
import { HiCodeBracket, HiOutlineCog } from "react-icons/hi2"
import { HiCreditCard, HiHome, HiShoppingBag, HiLightningBolt } from "react-icons/hi";
import DeveloperView from "./Pages/Developer/DeveloperView";

const sidebarsConfig = {
    items: [
        { key: HomeSidebarMenuKey.Home, icon: <HiHome /> },
        { key: HomeSidebarMenuKey.Developer, icon: <HiCodeBracket /> },
        { key: HomeSidebarMenuKey.MarketPlace, icon: <HiShoppingBag /> },
        { key: HomeSidebarMenuKey.Plans, icon: <HiLightningBolt /> },
        { key: HomeSidebarMenuKey.Billing, icon: <HiCreditCard/> },
        { key: HomeSidebarMenuKey.Settings, icon: <HiOutlineCog /> },
    ],
    initialDefaultKey: HomeSidebarMenuKey.Home,
    MenuKeys: HomeSidebarMenuKey,
    storeKeyName: 'home-sidebar-key'
};

 const renderView = (activeKey: SidebarMenuKey | string) => {
        switch (activeKey) {
              case HomeSidebarMenuKey.Home:
                        return <ProjectList />
              case HomeSidebarMenuKey.Developer:
                        return <DeveloperView />
                    default:
                        return <div className="p-4">View not implemented yet for {activeKey}</div>
        }
    }

const Home = () => {
    return (
        <MainDambaMaster
            sidebars={sidebarsConfig}
            content={renderView}
        />
    )
}

export default Home
