/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuth } from "@/auth";
import { useEffect, useState } from "react";
import JsonDiagram from "./Canvas/JsonDiagram";
import { useModuleActions } from "@/utils/hooks/useModule";
import { EntityScene } from "./Canvas/entityScene";
import { ModuleSwitcher } from "./components/ModuleSwitcher";
import { useSessionUser } from "@/stores/authStore";
import { useProjectActions } from "@/stores/useProjectSelectors";
import ServiceView from "./components/ServiceView";
import { ServiceProvider } from "@/providers/ServiceProvider";
import { fetchServicesByModuleId } from "@/services/module";
import SidebarDamba from "./components/Layout/SidebarDamba";

const Home = () => {
  const { setByPassLogin } = useAuth();
  const user = useSessionUser((state) => state.user);
  const { cProject } = useProjectActions()
  useEffect(() => {
    setByPassLogin(true);
  }, []);

  
 

  return (
          <main className="w-full min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
              {/* Sidebar */}
              <aside className="lg:sticky lg:top-0 lg:h-screen">
                <SidebarDamba />
              </aside>

              {/* Content */}
              <section className="min-w-0">
                <div className="container mx-auto px-4">
                  <ModuleSwitcher />

                  <ServiceProvider fetchServicesByModuleId={fetchServicesByModuleId}>
                    <ServiceView />
                  </ServiceProvider>
                </div>
              </section>
            </div>
          </main>

  )
}

export default Home
