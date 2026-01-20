/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-children-prop */
import { useEffect, useMemo } from 'react'
import Select from '@/components/ui/Select'
import ShowPopupOnClick, { BtnVariant } from './Layout/ShowPopupOnClick'
import AddProjectForm from '../Pages/Project/Form/AddProjectForm'

import {
    useProjectStore,
    selectProjects,
    selectProjectId,
} from '@/stores/useProjectStore'
import { useProjectActions } from '@/stores/useProjectSelectors'
import { useDialogContext } from '@/providers/DialogProvider'
import { useSessionUser } from '@/stores/authStore'
import useTranslation from '@/utils/hooks/useTranslation'

import { useApplicationStore } from '@/stores/useApplicationStore'
import { useApplicationActions } from '@/utils/hooks/useApplication'

type Props = { initialized: boolean }
type Option = { value: string; label: string }

export const ProjectAppHeaderSwitchers = ({ initialized }: Props) => {
    // ---- Project side
    const projects = useProjectStore(selectProjects)
    const projectId = useProjectStore(selectProjectId)
    const { addProject, setProject, cProject } = useProjectActions()
    const { closeDialog } = useDialogContext()
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSetting = useSessionUser((state) => state.setSetting)
    const { t } = useTranslation()

    const projectOptions: Option[] = useMemo(
        () =>
            projects.map((p) => ({
                value: p.id,
                label: p.name,
            })),
        [projects],
    )

    const selectedProject: Option | null = useMemo(
        () => projectOptions.find((o) => o.value === projectId) ?? null,
        [projectOptions, projectId],
    )

    const envOptions: Option[] = useMemo(
        () =>
            cProject?.environments?.map((o) => ({
                value: o,
                label: t(o),
            })) ?? [],
        [cProject?.environments, t],
    )

    const selectedEnv: Option | null = useMemo(() => {
        const current = user?.currentSetting?.env
        const op = envOptions.find((o) => o.value === current)
        return op ?? envOptions[0] ?? null
    }, [envOptions, user?.currentSetting?.env])

    const onSubmit = (data: any) => {
        if (!data?.error) {
            closeDialog()
            const nextUser = { ...user, currentSetting: data.setting }
            setUser(nextUser as any)
            addProject(data.project)
            setProject(data.project)
        }
    }

    const changeProject = (p: string) => {
        if (!p) return
        setProject(p)
        const nextUser = {
            ...user,
            currentSetting: { ...user?.currentSetting, projId: p },
        }
        setUser(nextUser as any)
    }

    const changeEnv = (env: string) => {
        if (!env) return
        const nextUser = {
            ...user,
            currentSetting: { ...user?.currentSetting, env },
        }
        setUser(nextUser as any)
    }

    useEffect(() => {
        setSetting()
    }, [
        user?.currentSetting?.env,
        user?.currentSetting?.projId,
        user?.currentSetting?.appId,
    ])

    // ---- App side
    const apps = useApplicationStore((s) => s.applications)
    const app = useApplicationStore((s) => s.cApp)
    const { setApplication } = useApplicationActions()

    const appOptions: Option[] = useMemo(
        () => apps.map((a) => ({ value: a.id ?? a.name, label: a.name })),
        [apps],
    )

    const selectedApp: Option | null = useMemo(
        () => appOptions.find((o) => o.value === app?.id) ?? null,
        [appOptions, app?.id],
    )

    const changeApp = (appId: string) => {
        if (!appId) return
        const cApp = apps.find((o) => o.id === appId)
        if (!cApp) return
        setApplication(cApp)
        const nextUser = {
            ...user,
            currentSetting: { ...user?.currentSetting, appId: cApp.id },
        }
        setUser(nextUser as any)
    }

    if (!initialized) return <div>Loading projects…</div>

    return (
        <div className="flex flex-wrap items-end gap-3">
            {/* Project */}
            <div className="min-w-[220px]">
                <span className="opacity-60 ml-1 text-xs block mb-1">
                    Project
                </span>

                {projects && projects.length > 1 ? (
                    <Select
                        size="sm"
                        placeholder="Please Select"
                        options={projectOptions}
                        value={selectedProject}
                        onChange={(opt: Option) =>
                            changeProject(opt?.value ?? '')
                        }
                    />
                ) : projectOptions.length === 1 ? (
                    <span className="text-sm font-medium">
                        {projectOptions[0].label}
                    </span>
                ) : (
                    <span className="opacity-60 text-xs">No projects</span>
                )}
            </div>

            {/* Add Project button inline */}
            <div className="pb-[2px]">
                <ShowPopupOnClick
                    title="Add New Project"
                    btnText=""
                    size="xs"
                    variant={'default' as BtnVariant}
                    css="mr-2"
                >
                    <AddProjectForm onSubmit={onSubmit} />
                </ShowPopupOnClick>
            </div>

            {/* Environment */}
            <div className="min-w-[220px]">
                {envOptions.length > 0 && (
                    <span className="opacity-60 text-xs block mb-1">
                        Environment
                    </span>
                )}

                {envOptions.length > 1 ? (
                    <Select
                        size="sm"
                        placeholder="Select Environment"
                        options={envOptions}
                        value={selectedEnv}
                        onChange={(opt: Option) =>
                            changeEnv(String(opt?.value ?? ''))
                        }
                    />
                ) : envOptions.length === 1 ? (
                    <span className="text-sm font-medium">
                        {envOptions[0].label}
                    </span>
                ) : null}
            </div>

            {/* Application */}
            <div className="min-w-[220px]">
                <span className="opacity-60 text-xs block mb-1">
                    Application
                </span>

                {appOptions.length > 1 ? (
                    <Select
                        size="sm"
                        placeholder="Select Application"
                        options={appOptions}
                        value={selectedApp}
                        onChange={(opt: Option | null) =>
                            changeApp(opt?.value || '')
                        }
                    />
                ) : appOptions.length === 1 ? (
                    <span className="text-sm font-medium">
                        {appOptions[0].label}
                    </span>
                ) : (
                    <span className="opacity-60 text-xs">
                        No applications available
                    </span>
                )}
            </div>
        </div>
    )
}
