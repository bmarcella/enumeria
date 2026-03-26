/* eslint-disable no-constant-condition */
// context/OrganizationContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'

import { useSessionUser } from '@/stores/authStore' 
import { Organization } from '../../../../common/Damba/v2/Entity/project'
import { useOrganizationStore } from '@/stores/useOrganizationStore'
import PreLoginLayout from '@/components/layouts/PreLoginLayout'
import { useAuth } from '@/auth'

type OrgCtx = { initialized: boolean }
const OrganizationContext = createContext<OrgCtx | undefined>(undefined)

type Props = {
    children: React.ReactNode
    fetchOrganizations: (id: string) => Promise<Organization[] | Organization>
    autoSelectSingle?: boolean
}

export function OrganizationProvider({
    children,
    fetchOrganizations,
    autoSelectSingle = true,
}: Props) {
    const { user } = useSessionUser((state) => state)
    const setUser = useOrganizationStore((s) => s.setUser)
    const setOrganizations = useOrganizationStore((s) => s.setOrganizations)
    const organizationId = useOrganizationStore((s) => s.organizationId)
    const setOrganization = useOrganizationStore((s) => s.setOrganization)
    const { authenticated } = useAuth()
    const [initialized, setInitialized] = useState(false)
    
    useEffect(() => {
        let cancelled = false
        async function init() {
            if (!user || !user.id) return
            setUser(user.id)
            if (cancelled) return
            const org = await fetchOrganizations(user.id);
            if (!org) {
                setInitialized(true);
                setOrganizations([]);
                return;
            };
            const orgs = Array.isArray(org) ? org : [org];
            setOrganizations(orgs)
            // Optional: auto-select the only org available
            if (autoSelectSingle && orgs.length === 1 && !organizationId) {
                const o = orgs[0]
                setOrganization(o.id || o.slug || o.name)
            }
            setInitialized(true);
        }
        if (authenticated) init();
        return () => {
            cancelled = true
        }
    }, [user, autoSelectSingle, authenticated])

    // Hard gate: must be logged in to see anything under this provider (optional)
    if (!authenticated) {
        return <PreLoginLayout>{children}</PreLoginLayout>
    }

    return (
        <OrganizationContext.Provider value={{ initialized }}>
            {children}
        </OrganizationContext.Provider>
    )
}

export function useOrganizationContext() {
    const ctx = useContext(OrganizationContext)
    if (!ctx)
        throw new Error(
            'useOrganizationContext must be used within OrganizationProvider',
        )
    return ctx
}
