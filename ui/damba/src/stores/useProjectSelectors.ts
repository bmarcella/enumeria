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
  const addProject = useProjectStore((s) => s.addProject)
  const getCProject = useProjectStore((s) => s.getCProject)
  const setProject = useProjectStore((s) => s.setProject)
  const setApplications = useProjectStore((s) => s.setApplications)
  const setModules = useProjectStore((s) => s.setModules)
  const reset = useProjectStore((s) => s.reset)
  const selectAllApps = useProjectStore((s) => s.selectAllApplicationsForCurrentProject)
  const selectAllModules = useProjectStore((s) => s.selectAllModulesForSelectedApplications)
  const cProject = useProjectStore((s) => s.cProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  return { setProject, setApplications, setModules, reset, selectAllApps, selectAllModules, getCProject, addProject, cProject, updateProject }
}
