/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { useOrganizationStore, selectSelectedOrganization } from '@/stores/useOrganizationStore'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useSessionUser } from '@/stores/authStore'
import { Application } from '../../../../common/Damba/v2/Entity/project'

type Props = {
  children: React.ReactNode
  autoSelectSingle?: boolean,
  fetchApplicationsByProjectId : (id_project: string) => Promise<Application[]>
}

export function ApplicationProvider({ children, autoSelectSingle = true, fetchApplicationsByProjectId }: Props) {
  const user = useSessionUser((s) => s.user);
  const org = useOrganizationStore(selectSelectedOrganization)
  const setScope = useApplicationStore((s) => s.setScope)
  const setApplications = useApplicationStore((s) => s.setApplications)
  const cApp = useApplicationStore((s) => s.cApp)
  const setApplication = useApplicationStore((s) => s.setApplication)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function init() {
      setScope(user?.id, org?.id, user.currentSetting?.projId)
      if(!user.currentSetting?.projId) return;
      if (cancelled ) return
      const apps = await fetchApplicationsByProjectId(user.currentSetting?.projId)
      setApplications(apps);
      if (autoSelectSingle && apps.length == 1 && !cApp?.id) {
        const a = apps[0]
        setApplication(a)
      }
      setInitialized(true)
    }
    init()
    return () => { cancelled = true }
  }, [user?.id, org?.id, user.currentSetting?.projId,  cApp?.id, setScope, setApplications, setApplication, autoSelectSingle])


  return <>{children}</>
}
