// hooks/useApplication.ts
import { useApplicationStore } from '@/stores/useApplicationStore'

export function useApplicationActions() {
  const setApplication = useApplicationStore((s) => s.setApplication)
  const setEnv = useApplicationStore((s) => s.setEnv)
  const reset = useApplicationStore((s) => s.reset)
  const env =  useApplicationStore((s) => s.env);
  return { setApplication, reset, setEnv, env}
}
