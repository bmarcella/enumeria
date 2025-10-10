// stores/useProjectSelectors.ts
import { useMemo } from 'react';
import { useProjectStore, selectSelectedProject, makeSelectApplications, makeSelectModules } from './useProjectStore';

export const useSelectedProject = () => useProjectStore(selectSelectedProject);

export const useSelectedApplications = () => {
  const sel = useMemo(makeSelectApplications, []);
  return useProjectStore(sel());
};

export const useSelectedModules = () => {
  const sel = useMemo(makeSelectModules, []);
  return useProjectStore(sel());
};


export function useProjectActions() {
  const setProject = useProjectStore((s) => s.setProject)
  const setApplications = useProjectStore((s) => s.setApplications)
  const setModules = useProjectStore((s) => s.setModules)
  const reset = useProjectStore((s) => s.reset)
  const selectAllApps = useProjectStore((s) => s.selectAllApplicationsForCurrentProject)
  const selectAllModules = useProjectStore((s) => s.selectAllModulesForSelectedApplications)
  return { setProject, setApplications, setModules, reset, selectAllApps, selectAllModules }
}
