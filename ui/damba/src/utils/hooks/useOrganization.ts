// hooks/useOrganization.ts

import { useOrganizationStore, selectOrganizations, selectOrganizationId, selectSelectedOrganization } from "@/stores/useOrganizationStore"


export const useOrganizations = () => useOrganizationStore(selectOrganizations)
export const useOrganizationId = () => useOrganizationStore(selectOrganizationId)
export const useSelectedOrganization = () => useOrganizationStore(selectSelectedOrganization)

export function useOrganizationActions() {
  const setOrganizations = useOrganizationStore((s) => s.setOrganizations)
  const setOrganization  = useOrganizationStore((s) => s.setOrganization)
  const reset            = useOrganizationStore((s) => s.reset)
  return { setOrganizations, setOrganization, reset }
}
