/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useAuth } from "@/auth";
import { useEffect, useState } from "react";
import JsonDiagram from "./Canvas/JsonDiagram";
import { useModuleActions } from "@/utils/hooks/useModule";
import { EntityScene } from "./Canvas/entityScene";
import { ModuleSwitcher } from "./components/ModuleSwitcher";
import { useSessionUser } from "@/stores/authStore";

const Home = () => {

  const { setByPassLogin } = useAuth();
  const { module } = useModuleActions();
  const [scene, setScene] = useState<EntityScene>()
  const user = useSessionUser((state) => state.user);
  useEffect(() => {
    setByPassLogin(true);
  }, []);

  
  useEffect(() => {
    setScene({ canvasBoxes: module?.services?.[0].canvasBoxes } as EntityScene)
  }, [module?.services?.[0].canvasBoxes]);

  return (
    <main className="container">
      <ModuleSwitcher></ModuleSwitcher>
      {scene &&
        <JsonDiagram scene={scene}></JsonDiagram>
      }
    </main>
  )
}

export default Home
