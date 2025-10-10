// stores/useOrganizationStore.ts
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Organization } from '../../../../common/Entity/project'

type OrgState = {
  userId?: string | null | undefined
  organizations: Organization[]
  organizationId: string        // selected org key (id | slug | name)
}

type OrgActions = {
  setUser: (userId?: string) => void
  setOrganizations: (orgs: Organization[]) => void
  setOrganization: (organizationId: string) => void
  reset: () => void
}

const initial: OrgState = {
  userId: undefined,
  organizations: [],
  organizationId: '',
}

export const useOrganizationStore = create<OrgState & OrgActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initial,

        setUser: (userId) => {
          const prev = get().userId
          if (prev !== userId) {
            // user switched → clear selection; orgs will be loaded by provider
            set({ ...initial, userId })
          }
        },

        setOrganizations: (organizations) => {
          set({ organizations })
          // reconcile persisted selection with the new list
          const { organizationId } = get()
          const exists = !!findOrg(organizations, organizationId)
          if (!exists) set({ organizationId: '' })
        },

        setOrganization: (organizationId) => set({ organizationId }),
        reset: () => set({ ...initial, userId: get().userId }),
      }),
      {
        name: 'damba.organization.selection.v1',
        // persist only lightweight stuff
        partialize: (s) => ({
          userId: s.userId,
          organizationId: s.organizationId,
        }),
      }
    )
  )
)

// --------- selectors & helpers ----------
export const selectUserId          = (s: OrgState) => s.userId
export const selectOrganizations   = (s: OrgState) => s.organizations
export const selectOrganizationId  = (s: OrgState) => s.organizationId

export const selectSelectedOrganization = (s: OrgState): Organization | undefined =>
  findOrg(s.organizations, s.organizationId)

function findOrg(orgs: Organization[], key?: string): Organization | undefined {
  if (!key) return undefined
  for (const o of orgs) {
    const keys = [o.id, o.slug, o.name].filter(Boolean) as string[]
    if (keys.includes(key)) return o
  }
  return undefined
}
