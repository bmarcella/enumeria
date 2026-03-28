import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import type { Project } from '../../../../common/Damba/v2/Entity/project'

type ProjectState = {
  userId?: string
  orgId?: string

  projects: Project[]
  projectId: string // '' = none selected
}

type ProjectActions = {
  setScope: (userId?: string, orgId?: string) => void

  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  removeProject: (projectId: string) => void

  setProject: (projectId: string) => void
  reset: () => void
}

const initial: ProjectState = {
  userId: undefined,
  orgId: undefined,
  projects: [],
  projectId: '',
}

function findProject(projects: Project[], key?: string): Project | undefined {
  if (!key) return undefined
  for (const p of projects) {
    const keys = [p.id, p.slug, p.name].filter(Boolean) as string[]
    if (keys.includes(key)) return p
  }
  return undefined
}

export const useProjectStore = create<ProjectState & ProjectActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initial,

        setScope: (userId, orgId) => {
          const prev = { userId: get().userId, orgId: get().orgId }
          const changed = prev.userId !== userId || prev.orgId !== orgId

          if (changed) set({ ...initial, userId, orgId })
          else set({ userId, orgId })
        },

        setProjects: (projects) => {
          const { projectId } = get()
          // if current project no longer exists, clear it
          const stillValid = !!findProject(projects, projectId)
          set({ projects, projectId: stillValid ? projectId : '' })
        },

        addProject: (project) => {
          const { projects, projectId } = get()
          const nextProjects = [...projects, project]
          // keep selection if still valid
          const stillValid = !!findProject(nextProjects, projectId)
          set({ projects: nextProjects, projectId: stillValid ? projectId : '' })
        },

        updateProject: (project) => {
          const { projects, projectId } = get()
          const nextProjects = projects.map((p) => (p.id === project.id ? project : p))
          // keep selection if still valid
          const stillValid = !!findProject(nextProjects, projectId)
          set({ projects: nextProjects, projectId: stillValid ? projectId : '' })
        },

        removeProject: (projectId) => {
          const { projects, projectId: currentProjectId } = get()
          const nextProjects = projects.filter((p) => p.id !== projectId)
          set({ projects: nextProjects, projectId: currentProjectId === projectId ? '' : currentProjectId })
        },

        setProject: (projectId) => {
          const nextId = projectId ?? ''
          set({ projectId: nextId })
        },

        reset: () => set({ ...initial, userId: get().userId, orgId: get().orgId }),
      }),
      {
        name: 'damba.project.selection.v2',
        partialize: (s) => ({
          userId: s.userId,
          orgId: s.orgId,
          projectId: s.projectId,
        }),
      },
    ),
  ),
)

// selectors
export const selectProjects = (s: ProjectState) => s.projects
export const selectProjectId = (s: ProjectState) => s.projectId

export const selectSelectedProject = (s: ProjectState) =>
  findProject(s.projects, s.projectId)