/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import { useSessionUser } from '@/stores/authStore'
import { useEntityStore } from '@/stores/useEntityStore'
import { useAppServiceStore } from '@/stores/ServiceStore'
import { CanvasBox } from '../../../../common/Damba/v2/Entity/CanvasBox'

type Props = {
  children: React.ReactNode
  autoSelectSingle?: boolean
  fetchEntitiesByServiceId: (serviceId: string, env: string) => Promise<CanvasBox[]>
}

export function EntityProvider({
  children,
  autoSelectSingle = true,
  fetchEntitiesByServiceId,
}: Props) {
  const user = useSessionUser((s) => s.user)
  const service = useAppServiceStore((s) => s.service)
  const setEntities = useEntityStore((s) => s.setEntities)
  const entity = useEntityStore((s) => s.entity)
  const setEntity = useEntityStore((s) => s.setEntity)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const env = user?.currentSetting?.env
      const serviceId = service?.id;
      if (!serviceId || !env) return
      const boxes = await fetchEntitiesByServiceId(serviceId, env);
      console.log(boxes);
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
  }, [service, service?.id, user, user?.currentSetting?.env])

  return <>{children}</>
}
