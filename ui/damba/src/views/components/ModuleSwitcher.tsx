import { useEffect, useMemo, useState } from 'react'
import Select from '../../components/ui/Select'
import { useModuleStore } from '@/stores/useModuleStore'
import { useModuleActions } from '@/utils/hooks/useModule'
import Button from '@/components/ui/Button'
import { HiOutlineCog, HiOutlinePlus, HiOutlineSwitchHorizontal } from 'react-icons/hi'

type Option = { value: string; label: string }

export const ModuleSwitcher = () => {
  const modules = useModuleStore((s) => s.modules)
  const module = useModuleStore((s) => s.module)
  const { selectModule } = useModuleActions()

  const options: Option[] = useMemo(
    () => modules.map((m) => ({ value: m.id ?? m.name, label: m.name })),
    [modules]
  )

  const selectedFromStore: Option | null = useMemo(
    () => options.find((o) => o.value === module?.id) ?? null,
    [options, module]
  )

  const [pending, setPending] = useState<Option | null>(selectedFromStore)

  // keep pending synced when store selection changes
  useEffect(() => {
    setPending(selectedFromStore)
  }, [selectedFromStore])

  const changed = (pending?.value ?? '') !== (selectedFromStore?.value ?? '')

  const applyChange = () => {
    const id = pending?.value
    if (!id) return
    const mod = modules.find((m) => m.id === id)
    if (!mod) return
    selectModule(mod)
  }

  if (options.length === 0) return <div className="opacity-60 text-xs">No Module available</div>

  return (
    <div className="w-full min-w-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button
            shape="circle"
            size="xs"
            variant="default"
            icon={<HiOutlinePlus />}
            onClick={() => {
              // TODO: add module
            }}
            aria-label="Add module"
            title="Add module"
          />

          <Button
            shape="circle"
            size="xs"
            variant="default"
            icon={<HiOutlineCog />}
            onClick={() => {
              // TODO: open settings
            }}
            aria-label="Module settings"
            title="Module settings"
          />

          <Button
            shape="circle"
            size="xs"
            variant="default"
            icon={<HiOutlineSwitchHorizontal />}
            disabled={!changed}
            onClick={applyChange}
            aria-label="Apply module change"
            title={changed ? 'Apply change' : 'No changes'}
          />
        </div>
      </div>
    </div>
  )
}
