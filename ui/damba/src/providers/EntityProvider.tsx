/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import { useSessionUser } from '@/stores/authStore'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useModuleStore, selectModule } from '@/stores/useModuleStore'
import { useOrganizationStore, selectSelectedOrganization } from '@/stores/useOrganizationStore'
import { useProjectActions } from '@/stores/useProjectSelectors'
import { useEntityStore } from '@/stores/useEntityStore'
import { useAppServiceStore } from '@/stores/ServiceStore'
import { CanvasBox } from '../../../../common/Entity/CanvasBox'

type Props = {
  children: React.ReactNode
  autoSelectSingle?: boolean
  /** fetch entities for given module and env (or adjust signature if you want) */
  fetchEntitiesByServiceId: (serviceId: string, env: string) => Promise<CanvasBox[]>
}

export function EntityProvider({
  children,
  autoSelectSingle = true,
  fetchEntitiesByServiceId,
}: Props) {
  const user = useSessionUser((s) => s.user)
  const cApp = useApplicationStore((s) => s.cApp)
  const cModule = useModuleStore(selectModule)
  const service = useAppServiceStore((s) => s.service)
  const org = useOrganizationStore(selectSelectedOrganization)
  const { cProject } = useProjectActions()
  const setEntities = useEntityStore((s) => s.setEntities)
  const entity = useEntityStore((s) => s.entity)
  const setEntity = useEntityStore((s) => s.setEntity)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const env = user?.currentSetting?.env
      const serviceId = service?.id;
      if (!serviceId || !env) return
      const boxes = await fetchEntitiesByServiceId(serviceId, env)
      if (cancelled) return;
      setEntities(boxes);
      if (autoSelectSingle && boxes.length === 1 && !entity) {
          setEntity(boxes[0])
      }
    }
    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id, user?.currentSetting?.env])

  return <>{children}</>
}
