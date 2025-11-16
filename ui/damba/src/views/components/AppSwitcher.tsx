import { useMemo } from 'react'
import Select from '../../components/ui/Select'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useApplicationActions } from '@/utils/hooks/useApplication';

type Option = { value: string; label: string }

export const AppSwitcher = () => {
  const apps = useApplicationStore((s) => s.applications)
  const app = useApplicationStore((s) => s.cApp)
  const { setApplication } = useApplicationActions()

  
 
  const options: Option[] = useMemo(
    () => apps.map((app) => ({ value: app.id ?? app.name, label: app.name })),
    [apps],
  )

  const selected: Option | null = useMemo(
    () => options.find((o) => o.value === app?.id) ?? null,
    [options, app],
  )

  if (options.length === 0) return <div className="opacity-60 text-xs">No applications available</div>

   const changeApp = (appId: string) => {
    if (!appId) return

    const cApp = apps.find((o) => o.id === appId)
    if (!cApp) return

    setApplication(cApp) // store expects an id string, not the full object
  }

  

  return (<>
  
     <div className="mr-4 mb-1">
      <span className="opacity-60 text-xs block mb-1">Application</span>
      {options.length > 1 ? (
        <Select
          size="sm"
          placeholder="Select Application"
          options={options}
          value={selected}
          onChange={(opt: Option | null) => changeApp(opt?.value || '')}
        />
      ) : (

        <>
          <span className="text-sm font-medium">{options[0].label}</span>
        </>


      )}
    </div>
  </>
 
  )
}
