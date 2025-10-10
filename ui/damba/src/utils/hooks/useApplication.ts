// hooks/useApplication.ts
import { useApplicationStore } from '@/stores/useApplicationStore'

export function useApplicationActions() {
  const setApplication = useApplicationStore((s) => s.setApplication)
  const reset = useApplicationStore((s) => s.reset)
  return { setApplication, reset }
}
