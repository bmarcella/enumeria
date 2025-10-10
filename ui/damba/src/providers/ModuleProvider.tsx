// providers/ModuleProvider.tsx
// ...imports unchanged

import { useModuleStore } from "@/stores/useModuleStore"
import { useState, useEffect } from "react"
import { AppModule } from "../../../../common/Entity/project"
import { useSessionUser } from "@/stores/authStore"
import { useApplicationStore } from "@/stores/useApplicationStore"
import { selectSelectedOrganization, useOrganizationStore } from "@/stores/useOrganizationStore"
import { useProjectStore, selectSelectedProject } from "@/stores/useProjectStore"

type Props = {
  children: React.ReactNode
  fetchModulesByApplication: ( AppId: string) => Promise<AppModule[]>
  autoSelectSingle?: boolean,
  byPassLogin: boolean
}


export function ModuleProvider({
  children,
  fetchModulesByApplication,
  autoSelectSingle = true,
  byPassLogin
}: Props) {

  const user = useSessionUser((s) => s.user);
  const setScope   = useModuleStore(s => s.setScope)
  const setModules = useModuleStore(s => s.setModules)
  const module     = useModuleStore(s => s.module)
  const setModule  = useModuleStore(s => s.setModule)
  const cApp = useApplicationStore((s) => s.cApp)
  const org = useOrganizationStore(selectSelectedOrganization);
  const project = useProjectStore(selectSelectedProject)

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const userId = user?.id;
      const orgId = org?.id
      const projectId = project?.id
      setScope(userId, orgId, projectId, cApp?.id)
      if (!cApp?.id && !byPassLogin) {
            setModules([])
            setInitialized(true)
            return
         }

      const mods = await fetchModulesByApplication(cApp?.id || "")
      if (cancelled) return

      setModules(mods)

      if (autoSelectSingle && mods.length === 1 && !module) {
        setModule(mods[0])   // <-- set object
      }
      setInitialized(true)
    }
    init()
    return () => { cancelled = true }
  }, [user?.id, org?.id, project?.id, cApp, module, setScope, setModules, setModule, fetchModulesByApplication, autoSelectSingle])

  if (!initialized) return <div>Loading modules…</div>
  return <>{children}</>
}
