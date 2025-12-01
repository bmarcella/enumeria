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

const Home = () => {
  const { setByPassLogin } = useAuth();
  const user = useSessionUser((state) => state.user);
  const { cProject } = useProjectActions()
  useEffect(() => {
    setByPassLogin(true);
  }, []);

  
 

  return (
    <main className="container">
      <ModuleSwitcher></ModuleSwitcher>
      <ServiceProvider  fetchServicesByModuleId={fetchServicesByModuleId}>
          <ServiceView />
      </ServiceProvider>
    </main>
  )
}

export default Home
