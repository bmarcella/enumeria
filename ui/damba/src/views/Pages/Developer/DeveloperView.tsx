import { DambaTabItem } from "@/components/Layout/DambaTabs";
import DambaTabsMaster from "@/components/Layout/DambaTabsMaster";
import { useMemo } from "react";
import { HiOutlineCube } from "react-icons/hi";
import AiAgentView from "./Agent/Index";
import RunnableView from "./Runnable/Index";
import ToolView from "./Tool/Index";
import DashboardView from "./Dashboard";
enum DeveloperTabs {
    Dashboard = "Dashboard",
    Agents = "Agents",
    Runnable = "Runnable",
    Tool = "Tool",
}
export default function DeveloperView() {

     const tabs: DambaTabItem[] = useMemo(
        () => [
            {
                value: DeveloperTabs.Dashboard,
                icon: <HiOutlineCube />,
                label: "Dashboard",
                title: "Dashboard",
                content: (
                   <DashboardView></DashboardView>
                ),
            },
            {
                value: DeveloperTabs.Agents,
                icon: <HiOutlineCube />,
                label: "AI Agents",
                title: "AI Agents",
                content: (
                   <AiAgentView></AiAgentView>
                ),
            },
          
            {
                value: DeveloperTabs.Tool,
                icon: <HiOutlineCube />,
                label: "Tools",
                title: "Tools",
                content: (
                   <ToolView></ToolView>
                ),
            },

            {
                value: DeveloperTabs.Runnable,
                icon: <HiOutlineCube />,
                label: "Runnable Lambdas",
                title: "Runnable Lambdas",
                content: (
                   <RunnableView></RunnableView>
                ),
            },
        ],
        [],
    )
  return (
    <div>
        <DambaTabsMaster items={tabs} initialTab={DeveloperTabs.Dashboard} />
    </div>
  )
}