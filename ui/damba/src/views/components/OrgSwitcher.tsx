import { useEffect, useMemo, useState } from 'react'
import {
  useOrganizationActions,
  useOrganizationId,
  useOrganizations,
} from '@/utils/hooks/useOrganization'
import { useSessionUser } from '@/stores/authStore'
import Select from '@/components/ui/Select';

type Option = { value: string; label: string }

export const OrgSwitcher = () => {
  const orgs = useOrganizations()               // [] | undefined while loading
  const orgId = useOrganizationId()             // string | undefined
  const { setOrganization } = useOrganizationActions()
  const user = useSessionUser((s) => s.user)
  const [defaultOrgName, setDefaultOrgName] = useState<string>();
  const loading = orgs == null                  // treat null/undefined as loading
  const hasData = Array.isArray(orgs) && orgs.length > 0

  const options: Option[] = useMemo(() => {
    if (!hasData) return []
    const fallbackName =
      (user?.firstName && user?.lastName)
        ? `${user.firstName} ${user.lastName}`
        : 'My Organization';

    setDefaultOrgName(fallbackName)
    return orgs!.map((org) => ({
      value: String(org.id ?? org.slug ?? org.name ?? ''),
      label: org?.name != "" && org?.name != undefined ? org?.name : fallbackName,
    }))
  }, [hasData, orgs, user?.firstName, user?.lastName])
  
  const selected: Option | null = useMemo(() => {
    if (!hasData) return null
    const idStr = String(orgId ?? '')
    return options.find((o) => o.value === idStr) ?? null
  }, [hasData, options, orgId])

  // Auto-select the single org if none selected yet
  useEffect(() => {
    if (!hasData) return
    if (!orgId && orgs!.length === 1) {
      const only = orgs![0]
      const nextId = String(only.id ?? only.slug ?? only.name ?? '')
      if (nextId) setOrganization(nextId)
    }
  }, [hasData, orgId, orgs, setOrganization])

  if (loading) {
    return (
      <div className="mr-4 mb-1">
        <span className="opacity-60 text-xs block mb-1">Organization</span>
        <span className="text-sm opacity-70">Loading…</span>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="mr-4 mb-1">
        <span className="opacity-60 text-xs block mb-1">Organization</span>
        <span className="text-sm opacity-70">No organizations found</span>
      </div>
    )
  }

  // ✅ Always show the Select when we have at least one organization
  return (
    <div className="mr-4 mb-1">
      <span className="opacity-60 text-xs block mb-1">Organization</span>
      {orgs && orgs.length > 1 ? (
        <Select
          size="sm"
          placeholder="Please Select"
          options={options}
          value={selected}
          onChange={(opt: Option | null) => {
            const next = opt?.value ?? ''
            if (next && next !== String(orgId ?? '')) {
              setOrganization(next)
            }
          }}
        />
      ) :
        orgs && orgs.length == 1 ?
          (<span className="text-sm font-medium">{orgs[0]?.name != "" && orgs[0]?.name != undefined ? orgs[0]?.name : defaultOrgName}</span>)
          : null}
    </div>
  )
}
