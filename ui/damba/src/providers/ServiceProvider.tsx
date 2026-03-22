/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react'
import { useModuleStore } from '@/stores/useModuleStore'
import { useAppServiceStore } from '@/stores/ServiceStore'

type Props = {
    children: React.ReactNode
    autoSelectSingle?: boolean
    fetchServicesByModuleId: (moduleId: string) => Promise<any[]>
}

export function ServiceProvider({
    children,
    autoSelectSingle = true,
    fetchServicesByModuleId,
}: Props) {
    const module = useModuleStore((s) => s.module)
    const setServices = useAppServiceStore((s) => s.setServices)
    const service = useAppServiceStore((s) => s.service)
    const setService = useAppServiceStore((s) => s.setService)

    useEffect(() => {
        let cancelled = false

        async function init() {
            const moduleId = module?.id
            if (!moduleId) return
            const svcList = await fetchServicesByModuleId(moduleId)
            if (cancelled) return
            setServices(svcList as any)
            // auto-select single service if none selected yet
            if (autoSelectSingle && svcList.length === 1 && !service) {
                setService(svcList[0] as any)
            }
        }
        init().catch((err) => {
            console.error('ServiceProvider init error', err)
        })

        return () => {
            cancelled = true
        }
    }, [module, module?.id])

    return <>{children}</>
}
