
// hooks/useModule.ts
import { useServiceStore } from '@/stores/useServiceStore';
import { Service } from '../../../../../common/Entity/project'

export function useServiceActions() {
  const setService = useServiceStore((s) => s.setService)
  const reset = useServiceStore((s) => s.reset)
  const setServices = useServiceStore((s) => s.setServices)
  const service = useServiceStore((s) => s.service);

  /** Set the current selected module (object-based) */
  const selectService = (mod?: Service) => {
    setService(mod)
  }

  /** Reset all module state but keep scope */
  const clearServices = () => {
    reset()
  }

  /** Update module list — typically called after fetching */
  const updateServices = (mods: Service[]) => {
    setServices(mods)
  }

  return {
    selectService,
    updateServices,
    clearServices,
    service
  }
}
