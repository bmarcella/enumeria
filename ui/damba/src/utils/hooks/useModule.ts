// hooks/useModule.ts
import { useModuleStore } from '@/stores/useModuleStore'
import { AppModule } from '../../../../../common/Entity/project'

export function useModuleActions() {
  const setModule = useModuleStore((s) => s.setModule)
  const reset = useModuleStore((s) => s.reset)
  const setModules = useModuleStore((s) => s.setModules)
  const module = useModuleStore((s) => s.module);

  /** Set the current selected module (object-based) */
  const selectModule = (mod?: AppModule) => {
    setModule(mod)
  }

  /** Reset all module state but keep scope */
  const clearModules = () => {
    reset()
  }

  /** Update module list — typically called after fetching */
  const updateModules = (mods: AppModule[]) => {
    setModules(mods)
  }

  return {
    selectModule,
    updateModules,
    clearModules,
    module
  }
}
