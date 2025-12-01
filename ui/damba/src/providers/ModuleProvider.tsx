/* eslint-disable @typescript-eslint/no-explicit-any */
// providers/ModuleProvider.tsx
// ...imports unchanged

import { useModuleStore } from "@/stores/useModuleStore"
import { useEffect } from "react"
import { useSessionUser } from "@/stores/authStore"
import { useApplicationStore } from "@/stores/useApplicationStore"
import { selectSelectedOrganization, useOrganizationStore } from "@/stores/useOrganizationStore"
import { useProjectActions } from "@/stores/useProjectSelectors"

type Props = {
  children: React.ReactNode
  autoSelectSingle?: boolean
  fetchModulesByAppId: (id: string)=>Promise<any>
}


export function ModuleProvider({
  children,
  autoSelectSingle = true,
  fetchModulesByAppId
}: Props) {

  const user = useSessionUser((s) => s.user);
  const setScope   = useModuleStore(s => s.setScope)
  const setModules = useModuleStore(s => s.setModules)
  const module     = useModuleStore(s => s.module)
  const setModule  = useModuleStore(s => s.setModule)
  const cApp = useApplicationStore((s) => s.cApp)
  const org = useOrganizationStore(selectSelectedOrganization);
  const { cProject } = useProjectActions();

  useEffect(() => {
    let cancelled = false
    async function init() {
      const userId = user?.id;
      const orgId = org?.id
      const projectId = cProject?.id
      setScope(userId, orgId, projectId, cApp?.id);
      if(!cApp?.id) return;
      const mods = await fetchModulesByAppId(cApp?.id);
      if (cancelled) return;
      setModules(mods)
      if (autoSelectSingle && mods.length === 1 && !module) {
          setModule(mods[0])   // <-- set object
      }
    }
    init()
    return () => { cancelled = true }
  }, [user?.id, user?.currentSetting?.env, cApp?.id])

  return <>{children}</>
}
