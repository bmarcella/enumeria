/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-children-prop */
import { useEffect, useMemo, useRef } from 'react'
import {
  useProjectStore,
  selectProjects,
  selectProjectId,
  selectSelectedProject,
} from '@/stores/useProjectStore'
import Select from '@/components/ui/Select'
import { useSessionUser } from '@/stores/authStore'
import useTranslation from '@/utils/hooks/useTranslation'
import { HiRefresh } from 'react-icons/hi'
import Button from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

type Props = { initialized: boolean }
export type Option = { value: string; label: string }

export const ProjSwitcher = ({ initialized }: Props) => {
  const projects = useProjectStore(selectProjects)
  const projectId = useProjectStore(selectProjectId)
  const selectedProject = useProjectStore(selectSelectedProject)
  const setProject = useProjectStore((s) => s.setProject)
  const user = useSessionUser((state) => state.user)
  const setUser = useSessionUser((state) => state.setUser)
  const setSetting = useSessionUser((state) => state.setSetting)
  const navigate = useNavigate();
  const { t } = useTranslation()

  const options: Option[] = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.name })),
    [projects],
  )

  const selected: Option | null = useMemo(
    () => options.find((o) => o.value === projectId) ?? null,
    [options, projectId],
  )

  const optionsEnv: Option[] = useMemo(
    () =>
      (selectedProject?.environments ?? []).map((env) => ({
        value: env,
        label: t(env),
      })),
    [selectedProject?.environments, t],
  )

  const selectedEnv: Option | null = useMemo(() => {
    if (!optionsEnv.length) return null
    const current = user?.currentSetting?.env
    return optionsEnv.find((o) => o.value === current) ?? optionsEnv[0]
  }, [optionsEnv, user?.currentSetting?.env])

  const changeProject = (id_project?: string ) => {
    // clear user setting first (in case something syncs store from user)
    if (user) {
      setUser({
        ...user,
        currentSetting: { ...user.currentSetting, projId: id_project ?? '' },
      })
    }
    // then clear store selection
    setProject(id_project ?? '')
    navigate((id_project) ?'/projects' : "/home") ;
  }

  const changeEnv = (env: string) => {
    if (!env || !user) return
    setUser({
      ...user,
      currentSetting: { ...user.currentSetting, env },
    })
  }

  const prev = useRef<{ env?: string; projId?: string }>({})

  useEffect(() => {
    const env = user?.currentSetting?.env
    const projId = user?.currentSetting?.projId

    if (prev.current.env === env && prev.current.projId === projId) return
    prev.current = { env, projId }

    setSetting()
  }, [setSetting, user?.currentSetting?.env, user?.currentSetting?.projId])

  if (!initialized) return <div>Loading projects…</div>

  return (
    <>
      <div className="mr-4 mb-1">
        <span className="opacity-60 text-xs block mb-1">Project</span>
        <span className="text-sm font-medium">{selected?.label ?? '—'}</span>
      </div>

      <div className="mr-4 mb-1">
        <span className="opacity-60 ml-1 text-xs">
          <Button className="mr-2" icon={<HiRefresh />} onClick={changeProject} />
        </span>
      </div>

      <div className="mr-4 mb-1">
        {optionsEnv.length > 0 && (
          <span className="opacity-60 text-xs block mb-1">Environement.</span>
        )}

        {optionsEnv.length > 1 && (
          <Select
            size="sm"
            placeholder="Select Environment"
            options={optionsEnv}
            value={selectedEnv}
            onChange={(opt: Option) => changeEnv(String(opt.value))}
          />
        )}

        {optionsEnv.length === 1 && (
          <span className="text-sm font-medium">{optionsEnv[0].label}</span>
        )}
      </div>
    </>
  )
}