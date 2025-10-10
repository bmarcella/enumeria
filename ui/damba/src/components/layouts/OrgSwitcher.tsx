import { useMemo } from 'react';
import Select from '../ui/Select';
import { useOrganizationActions, useOrganizationId, useOrganizations } from '@/utils/hooks/useOrganization';

type Props = { initialized: boolean };
type Option = { value: string; label: string };

export const OrgSwitcher = ({ initialized }: Props) => {
  const orgs = useOrganizations();
  const orgId = useOrganizationId();
  const { setOrganization } = useOrganizationActions();

  const options: Option[] = useMemo(
    () =>
      orgs.map((org) => ({
        value: org.id || org.slug || org.name, // fallback if id missing
        label: org.name,
      })),
    [orgs]
  );

  const selected: Option | null = useMemo(
    () => options.find((o) => o.value === orgId) ?? null,
    [options, orgId]
  );

  if (!initialized) return <div>Loading organizations…</div>;
  if (options.length === 0) return <div>No organizations available</div>;

  return (
    <>
      {orgs && orgs.length > 1 ? (
        <div className="mr-4 mb-1">
            <span className="opacity-60 text-xs block mb-1">Organization</span>
            <Select
            size="sm"
            placeholder="Please Select"
            options={options}
            value={selected}
            onChange={(opt: Option | null) => setOrganization(opt?.value ?? '')}
            />
        </div>
        ) : orgs && orgs.length === 1 ? (
        <div className="mr-4 mb-1">
            <span className="opacity-60 text-xs block ml-1">Organization:</span>{' '}
            <span className="text-sm font-medium ml-1">{orgs[0].name}</span>
        </div>
        ) : null }
    </>

  );
};


