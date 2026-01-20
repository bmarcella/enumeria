/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-children-prop */
import { useEffect, useMemo } from 'react'
import {
    useProjectStore,
    selectProjects,
    selectProjectId,
} from '@/stores/useProjectStore'
import { useProjectActions } from '@/stores/useProjectSelectors'
import Select from '@/components/ui/Select'
import { useDialogContext } from '@/providers/DialogProvider'
import { useSessionUser } from '@/stores/authStore'
import useTranslation from '@/utils/hooks/useTranslation'
import ShowPopupOnClick, { BtnVariant } from './Layout/ShowPopupOnClick'
import AddProjectForm from '../Pages/Project/Form/AddProjectForm'

type Props = { initialized: boolean }
export type Option = { value: string; label: string }

export const ProjSwitcher = ({ initialized }: Props) => {
    const projects = useProjectStore(selectProjects)
    const projectId = useProjectStore(selectProjectId)
    const { addProject, setProject, cProject } = useProjectActions()
    const { closeDialog } = useDialogContext()
    const user = useSessionUser((state) => state.user)
    const { t } = useTranslation()
    const setUser = useSessionUser((state) => state.setUser)
    const setSetting = useSessionUser((state) => state.setSetting)
    const options: Option[] | null = useMemo(
        () =>
            projects.map((p) => ({
                value: p.id, // fallback if id missing
                label: p.name,
            })),
        [projects, addProject],
    )
    const selected: Option | null = useMemo(
        () => options.find((o) => o.value === projectId) ?? null,
        [options, projectId],
    )

    const optionsEnv: Option[] | null = useMemo(
        () =>
            cProject?.environments?.map((o) => {
                return {
                    value: o,
                    label: t(o),
                } as Option
            }) ?? null,
        [cProject?.environments],
    )

    const selectedEnv: Option | null = useMemo(() => {
        const op = optionsEnv?.find((o) => o.value == user.currentSetting?.env)
        if (op) return op
        const o = optionsEnv?.[0]
        return o as Option
    }, [user, user?.currentSetting?.env])

    const onSubmit = (data: any) => {
        if (!data.error) {
            closeDialog()
            user.currentSetting = data.setting
            setUser(user)
            addProject(data.project)
            setProject(data.project)
        }
    }

    const changeProject = (p: string) => {
        setProject(p)
        user!.currentSetting!.projId! = p
        setUser(user)
    }

    const changeEnv = async (env: any) => {
        if (!env) return
        user.currentSetting!.env! = env
        setUser(user)
    }

    useEffect(() => {
        setSetting()
    }, [user, user?.currentSetting?.env, user?.currentSetting?.projId])

    if (!initialized) return <div>Loading projects…</div>
    return (
        <>
            <div className="mr-4 mb-1">
                <span className="opacity-60 ml-1 text-xs ">Project</span>
                {projects && projects.length > 1 && (
                    <>
                        <Select
                            size="sm"
                            placeholder="Please Select"
                            options={options}
                            value={selected}
                            onChange={(opt: Option) =>
                                changeProject(opt?.value ?? undefined)
                            }
                        />
                    </>
                )}
                {options &&
                    options.length != 0 &&
                    projects &&
                    projects.length == 1 && (
                        <>
                            <span className="text-sm font-medium">
                                {options[0].label}
                            </span>
                        </>
                    )}
            </div>

            <div className="mr-4 mb-1">
                <span className="opacity-60 ml-1 text-xs ">
                    <ShowPopupOnClick
                        title={'Add New Project'}
                        btnText={''}
                        size={'xs'}
                        variant={'default' as BtnVariant}
                        css={'mr-2'}
                    >
                        <AddProjectForm onSubmit={onSubmit} />
                    </ShowPopupOnClick>
                </span>
            </div>

            <div className="mr-4 mb-1">
                {optionsEnv && optionsEnv.length > 0 && (
                    <span className="opacity-60 text-xs block mb-1">
                        Environement.
                    </span>
                )}
                {optionsEnv && optionsEnv.length > 1 && (
                    <Select
                        size="sm"
                        placeholder="Select Application"
                        options={optionsEnv}
                        value={selectedEnv}
                        onChange={(opt: Option) => changeEnv(String(opt.value))}
                    />
                )}
                {optionsEnv && optionsEnv.length == 1 && (
                    <>
                        <span className="text-sm font-medium">
                            {optionsEnv[0].label}
                        </span>
                    </>
                )}
            </div>
        </>
    )
}
