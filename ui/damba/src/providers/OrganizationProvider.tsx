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
  fetchOrganizationsByUser: (userId: string ) => Promise<Organization[]>
  /** If true, auto-select the single org returned (nice DX for single-tenant users) */
  autoSelectSingle?: boolean,
  byPassLogin: boolean
}

export function OrganizationProvider({
  children,
  fetchOrganizationsByUser,
  autoSelectSingle = true,
  byPassLogin
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
      if (!user.userId && !byPassLogin) return;
      setUser(user.userId)
      const orgs = await fetchOrganizationsByUser(user.userId || 0);
      if (cancelled) return;
      setOrganizations(orgs)

      // Optional: auto-select the only org available
      if (autoSelectSingle && orgs.length === 1 && !organizationId) {
          const o = orgs[0]
          setOrganization(o.id || o.slug || o.name)
      }
      setInitialized(true);
    }

    init()
    return () => { cancelled = true }
  }, [user?.userId, setUser, setOrganizations, setOrganization, organizationId, fetchOrganizationsByUser, autoSelectSingle])

  // Hard gate: must be logged in to see anything under this provider (optional)
  if (!user?.userId && !byPassLogin) {
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
