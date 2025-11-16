/* eslint-disable no-constant-condition */
// context/OrganizationContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'

import { useSessionUser } from '@/stores/authStore'     // your existing auth store
import { Organization } from '../../../../common/Entity/project'
import { useOrganizationStore } from '@/stores/useOrganizationStore'
import PreLoginLayout from '@/components/layouts/PreLoginLayout'

type OrgCtx = { initialized: boolean }
const OrganizationContext = createContext<OrgCtx | undefined>(undefined)

type Props = {
  children: React.ReactNode
  fetchOrganizations: (id: string) => Promise<Organization[]>
  autoSelectSingle?: boolean,
}

export function OrganizationProvider({
  children,
  fetchOrganizations,
  autoSelectSingle = true,
}: Props) {
  const { user } = useSessionUser((state) => state);

  const setUser = useOrganizationStore((s) => s.setUser)
  const setOrganizations = useOrganizationStore((s) => s.setOrganizations)
  const organizationId = useOrganizationStore((s) => s.organizationId)
  const setOrganization = useOrganizationStore((s) => s.setOrganization)

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function init() {
      setUser(user.id);
      if (!user.id) return
      const orgs = await fetchOrganizations(user?.id);
      if (cancelled) return;
      setOrganizations(orgs)
      // Optional: auto-select the only org available
      if (autoSelectSingle && orgs.length === 1 && !organizationId) {
        const o = orgs[0]
        setOrganization(o.id || o.slug || o.name)
      }
      setInitialized(true);
    }
    if (user.id && user.id != undefined) init();
    return () => { cancelled = true }
  }, [user, setUser, setOrganizations, setOrganization, organizationId, fetchOrganizations, autoSelectSingle])

  // Hard gate: must be logged in to see anything under this provider (optional)
  if (!user?.id) {
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
  if (!ctx) throw new Error('useOrganizationContext must be used within OrganizationProvider')
  return ctx
}
