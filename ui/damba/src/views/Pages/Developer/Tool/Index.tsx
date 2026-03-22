import MainDambaMaster from "@/components/Layout/MainDambaMaster";
import { ToolSidebarMenuKey } from "@/components/Layout/SideBarDambaPure";
import { HiHome } from "react-icons/hi";
import { HiCodeBracket, HiListBullet, HiPlus } from "react-icons/hi2";
import ToolArtifactsListPage from "./list/ToolArtifactsListPage";
import ToolArtifactPage from "./create/ToolArtifactPage";
import { useMemo, useState } from "react";

export default function ToolView() {
    const [defaultKey, setDefaultKey] = useState<ToolSidebarMenuKey>(ToolSidebarMenuKey.Tool)
    
    const sidebarsConfig = useMemo(()=> ({
        items: [
            { key: ToolSidebarMenuKey.Tool, icon: <HiListBullet /> },
            { key: ToolSidebarMenuKey.CreateTool, icon: <HiPlus /> },
        ],
        initialDefaultKey: defaultKey,
        MenuKeys: ToolSidebarMenuKey,
        storeKeyName: 'tool-sidebar-key'
    }), [defaultKey]);

     const renderView = (activeKey: ToolSidebarMenuKey | string, setKey: (key: string) => void) => {
        switch (activeKey) {
              case ToolSidebarMenuKey.Tool:
                        return <ToolArtifactsListPage gotToCreate={() => {
                            setKey(ToolSidebarMenuKey.CreateTool);
                            setDefaultKey(ToolSidebarMenuKey.CreateTool);
                        }} />
              case ToolSidebarMenuKey.CreateTool:
                        return <ToolArtifactPage />
                    default:
                        return <div className="p-4">View not implemented yet for {activeKey}</div>
        }
    }
    return (
       <>
        <MainDambaMaster
            sidebars={sidebarsConfig}
            content={renderView as any}
        />
       </>
    )
}