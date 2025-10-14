import { useEffect, useState } from 'react'
import { useOrganizationStore, selectSelectedOrganization } from '@/stores/useOrganizationStore'
import { useProjectStore, selectSelectedProject } from '@/stores/useProjectStore'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useSessionUser } from '@/stores/authStore'
import { Application } from '../../../../common/Entity/project'

type Props = {
  children: React.ReactNode
  fetchApplicationsByProject: (userId: string, orgId: string, projectId: string) => Promise<Application[]>
  autoSelectSingle?: boolean,
  byPassLogin: boolean
}

export function ApplicationProvider({ children, fetchApplicationsByProject, autoSelectSingle = true, byPassLogin }: Props) {
  const user = useSessionUser((s) => s.user);
  const org = useOrganizationStore(selectSelectedOrganization)
  const project = useProjectStore(selectSelectedProject)
  const setScope = useApplicationStore((s) => s.setScope)
  const setApplications = useApplicationStore((s) => s.setApplications)
  const cApp = useApplicationStore((s) => s.cApp)
  const setApplication = useApplicationStore((s) => s.setApplication)

  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    let cancelled = false
    async function init() {
      const userId = user?.id || "";
      const orgId = org?.id!
      const projectId = project?.id!;
      setScope(userId, orgId, projectId)

      if ((!userId || !orgId || !projectId) && !byPassLogin) {
        setApplications([])
        return
      }

      const apps = await fetchApplicationsByProject(userId, orgId, projectId)
      if (cancelled) return

      setApplications(apps)

      if (autoSelectSingle && apps.length === 1 && !cApp?.id) {
        const a = apps[0]
        setApplication(a)
      }

      setInitialized(true)
    }
    init()
    return () => { cancelled = true }
  }, [user?.id, org?.id, project?.id, cApp?.id, setScope, setApplications, setApplication, fetchApplicationsByProject, autoSelectSingle])

  if (!initialized) return <div>Loading applications…</div>

  return <>{children}</>
}
