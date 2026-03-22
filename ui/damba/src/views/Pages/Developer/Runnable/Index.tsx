import MainDambaMaster from "@/components/Layout/MainDambaMaster";
import { RunnableSidebarMenuKey } from "@/components/Layout/SideBarDambaPure";
import { HiHome, HiPlus } from "react-icons/hi";
import { HiCodeBracket, HiListBullet } from "react-icons/hi2";
import RunnableLambdaCreatePage from "./create/RunnableLambdaCreatePage";
import RunnableLambdaPage from "./RunnableLambda";
import { useMemo, useState } from "react";

export default function RunnableView() {

    const [defaultKey, setDefaultKey] = useState<RunnableSidebarMenuKey>(RunnableSidebarMenuKey.Runnable)
    
    const sidebarsConfig = useMemo(()=> ({
        items: [
            { key: RunnableSidebarMenuKey.Runnable, icon: <HiListBullet /> },
            { key: RunnableSidebarMenuKey.CreateRunnable, icon: <HiPlus /> },
        ],
        initialDefaultKey: defaultKey,
        MenuKeys: RunnableSidebarMenuKey,
        storeKeyName: 'runnable-sidebar-key'
    }), [defaultKey]);

     const renderView = (activeKey: RunnableSidebarMenuKey | string, setKey: (key: string) => void) => {
        switch (activeKey) {
              case RunnableSidebarMenuKey.Runnable:
                        return <RunnableLambdaPage gotToCreate={() => {
                            setKey(RunnableSidebarMenuKey.CreateRunnable);
                            setDefaultKey(RunnableSidebarMenuKey.CreateRunnable);
                        }}/>
              case RunnableSidebarMenuKey.CreateRunnable:
                        return <RunnableLambdaCreatePage/>
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