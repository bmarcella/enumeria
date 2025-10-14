// providers/ProjectProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useSessionUser } from '@/stores/authStore';
import { useOrganizationStore, selectSelectedOrganization } from '@/stores/useOrganizationStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { Project } from '../../../../common/Entity/project';
type ProjCtx = { initProject: boolean }
const ProjectContext = createContext<ProjCtx | undefined>(undefined)
type Props = {
  children: React.ReactNode;
  /** Must return ONLY the projects for this user in this org */
  fetchProjectsByUserAndOrg: (userId: string, orgId: string) => Promise<Project[]>;
  /** Auto-select the single project (DX nice-to-have) */
  autoSelectSingle?: boolean;
  byPassLogin: boolean
};

export function ProjectProvider({
  children,
  fetchProjectsByUserAndOrg,
  autoSelectSingle = true,
  byPassLogin
}: Props) {
  const authUser = useSessionUser((s) => s.user);
  const org = useOrganizationStore(selectSelectedOrganization);
  const setScope = useProjectStore((s) => s.setScope);
  const setProjects = useProjectStore((s) => s.setProjects);
  const projectId = useProjectStore((s) => s.projectId);
  const setProject = useProjectStore((s) => s.setProject);
  const [initProject, setInitialized] = useState(false)

  // Sync scope (user + org) into the store and load projects on change
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const userId = authUser?.id || "";
      const orgId = org?.id || "";
      setScope(userId, orgId);

      if ((!userId || !orgId) && !byPassLogin) {
        setProjects([]); // no org or user -> empty list
        return;
      }

      const projects = await fetchProjectsByUserAndOrg(userId, orgId);
      if (cancelled) return;

      setProjects(projects);

      if (autoSelectSingle && projects.length === 1 && !projectId) {
        const p = projects[0];
        setProject(p.id ?? p.slug ?? p.name);
      }
      setInitialized(true);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id, org?.id, setScope, setProjects, projectId, setProject, fetchProjectsByUserAndOrg, autoSelectSingle]);

  return (<ProjectContext.Provider value={{ initProject }}>
    {children}
  </ProjectContext.Provider>);
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProejectContext must be used within ProjectProvider')
  return ctx
}