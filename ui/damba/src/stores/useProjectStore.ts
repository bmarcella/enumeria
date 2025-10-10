// stores/useProjectStore.ts
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { Project, Application, AppModule } from '../../../../common/Entity/project';

type ProjectState = {
  // scope
  userId?: string;
  orgId?: string;

  // data
  projects: Project[];

  // selections
  projectId: string;
  applicationIds: string[];
  moduleIds: string[];
};

type ProjectActions = {
  /** Set the scope (user + org). Resets selections if scope changes. */
  setScope: (userId?: string, orgId?: string) => void;

  /** Replace project list, reconciling persisted selections to remain valid. */
  setProjects: (projects: Project[]) => void;

  /** Cascading selections */
  setProject: (projectId: string) => void;
  setApplications: (applicationIds: string[]) => void;
  setModules: (moduleIds: string[]) => void;

  /** Reset (keeps current scope) */
  reset: () => void;

  /** Helpers */
  selectAllApplicationsForCurrentProject: () => void;
  selectAllModulesForSelectedApplications: () => void;
};

const initial: ProjectState = {
  userId: undefined,
  orgId: undefined,
  projects: [],
  projectId: '',
  applicationIds: [],
  moduleIds: [],
};

export const useProjectStore = create<ProjectState & ProjectActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initial,

        setScope: (userId, orgId) => {
          const prev = { userId: get().userId, orgId: get().orgId };
          const changed = prev.userId !== userId || prev.orgId !== orgId;
          if (changed) {
            // scope changed → clear everything except scope
            set({ ...initial, userId, orgId });
          } else {
            set({ userId, orgId });
          }
        },

        setProjects: (projects) => {
          set({ projects });
          // Reconcile selections with new list
          const { projectId, applicationIds, moduleIds } = get();

          const proj = findProject(projects, projectId);
          if (!proj) {
            set({ projectId: '', applicationIds: [], moduleIds: [] });
            return;
          }

          const validApps = (proj.applications ?? []).map(a => a.id ?? a.name);
          const nextAppIds = applicationIds.filter(id => validApps.includes(id));

          const validMods = nextAppIds
            .flatMap(id => (proj.applications ?? []).find(a => (a.id ?? a.name) === id)?.modules ?? [])
            .map(m => m.id ?? m.name);
          const nextModIds = moduleIds.filter(id => validMods.includes(id));

          set({ applicationIds: nextAppIds, moduleIds: nextModIds });
        },

        setProject: (projectId) => set({ projectId, applicationIds: [], moduleIds: [] }),
        setApplications: (applicationIds) => set({ applicationIds, moduleIds: [] }),
        setModules: (moduleIds) => set({ moduleIds }),

        reset: () => set({ ...initial, userId: get().userId, orgId: get().orgId }),

        selectAllApplicationsForCurrentProject: () => {
          const { projects, projectId } = get();
          const p = findProject(projects, projectId);
          const ids = (p?.applications ?? []).map(a => a.id ?? a.name);
          set({ applicationIds: ids, moduleIds: [] });
        },

        selectAllModulesForSelectedApplications: () => {
          const { projects, projectId, applicationIds } = get();
          const p = findProject(projects, projectId);
          const apps = (p?.applications ?? []).filter(a => applicationIds.includes(a.id ?? a.name));
          const ids = apps.flatMap(a => a.modules ?? []).map(m => m.id ?? m.name);
          set({ moduleIds: ids });
        },
      }),
      {
        name: 'damba.project.selection.v2',
        // Persist only scope + lightweight selections (never the whole project list)
        partialize: (s) => ({
          userId: s.userId,
          orgId: s.orgId,
          projectId: s.projectId,
          applicationIds: s.applicationIds,
          moduleIds: s.moduleIds,
        }),
      }
    )
  )
);

/* --------------------------- selectors & helpers --------------------------- */
export const selectScopeUserId = (s: ProjectState) => s.userId;
export const selectScopeOrgId  = (s: ProjectState) => s.orgId;

export const selectProjects = (s: ProjectState) => s.projects;
export const selectProjectId = (s: ProjectState) => s.projectId;
export const selectApplicationIds = (s: ProjectState) => s.applicationIds;
export const selectModuleIds = (s: ProjectState) => s.moduleIds;

export const selectSelectedProject = (s: ProjectState): Project | undefined =>
  findProject(s.projects, s.projectId);

export const makeSelectApplications = () => (s: ProjectState): Application[] => {
  const proj = selectSelectedProject(s);
  if (!proj) return [];
  const map = new Map((proj.applications ?? []).map(a => [a.id ?? a.name, a]));
  return s.applicationIds.map(id => map.get(id)).filter(Boolean) as Application[];
};

export const makeSelectModules = () => (s: ProjectState): AppModule[] => {
  const apps = makeSelectApplications()(s);
  const modMap = new Map(apps.flatMap(a => (a.modules ?? [])).map(m => [m.id ?? m.name, m]));
  return s.moduleIds.map(id => modMap.get(id)).filter(Boolean) as AppModule[];
};

function findProject(projects: Project[], key?: string): Project | undefined {
  if (!key) return undefined;
  for (const p of projects) {
    const keys = [p.id, p.slug, p.name].filter(Boolean) as string[];
    if (keys.includes(key)) return p;
  }
  return undefined;
}
