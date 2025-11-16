import { useMemo } from 'react'
import Select from '../../components/ui/Select'
import { useModuleStore } from '@/stores/useModuleStore';
import { useModuleActions } from '@/utils/hooks/useModule';

type Option = { value: string; label: string }

export const ModuleSwitcher = () => {
  const modules = useModuleStore((s) => s.modules)
  const module = useModuleStore((s) => s.module)
  const { selectModule } = useModuleActions()

  const options: Option[] = useMemo(
    () => modules.map((app) => ({ value: app.id ?? app.name, label: app.name })),
    [modules],
  )

  const selected: Option | null = useMemo(
    () => options.find((o) => o.value === module?.id) ?? null,
    [options, module],
  )

  if (options.length === 0) return <div className="opacity-60 text-xs">No Module available</div>
  const changeModule = (Id: string) => {
    if (!Id) return

    const mod = modules.find((o) => o.id === Id)
    if (!mod) return
    selectModule(mod) // store expects an id string, not the full object
  }

  return (
    <div className="mr-4 mb-1">
      <span className="opacity-60 text-xs block mb-1">Module</span>
      {options.length > 1 ? (
        <Select
          size="sm"
          placeholder="Select Application"
          options={options}
          value={selected}
          onChange={(opt: Option | null) => changeModule(opt?.value || '')}
        />
      ) : (

        <>
          <span className="text-sm font-medium">{options[0].label}</span>
        </>
      )}
    </div>
  )
}
