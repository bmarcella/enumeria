import MainDambaMaster from "@/components/Layout/MainDambaMaster";
import { AgentSidebarMenuKey } from "@/components/Layout/SideBarDambaPure";
import {  HiPlus } from "react-icons/hi";
import {  HiListBullet } from "react-icons/hi2";
import AgentCreationStep from "./AgentsDefinition/create";
import ShowListAgents from "./AgentsDefinition/show/ShowListAgents";
import { useMemo, useState } from "react";

export default function AiAgentView() {
    const [defaultKey, setDefaultKey] = useState<AgentSidebarMenuKey>(AgentSidebarMenuKey.Agents)
    const sidebarsConfig = useMemo(()=> ({
        items: [
            { key: AgentSidebarMenuKey.Agents, icon: <HiListBullet /> },
            { key: AgentSidebarMenuKey.CreateAgent, icon: <HiPlus /> },
        ],
        initialDefaultKey: defaultKey,
        MenuKeys: AgentSidebarMenuKey,
        storeKeyName: 'agent-sidebar-key'
    }), [defaultKey]);
    
     const renderView = (activeKey: AgentSidebarMenuKey | string, setKey: (key: string) => void) => {
        switch (activeKey) {
              case AgentSidebarMenuKey.Agents:
                        return <ShowListAgents gotToCreate={() => {
                            setKey(AgentSidebarMenuKey.CreateAgent);
                            setDefaultKey(AgentSidebarMenuKey.CreateAgent);
                          }
                        }></ShowListAgents>
              case AgentSidebarMenuKey.CreateAgent:
                        return <AgentCreationStep></AgentCreationStep>
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