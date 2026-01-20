/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useModuleStore } from '@/stores/useModuleStore'
import classNames from '@/utils/classNames'
import DambaHeader from '@/views/components/Layout/DambaHeader'
import { SidebarMenuKey } from '@/views/components/Layout/SideBarDambaPure'
import {
    HiOutlineCheckCircle,
    HiOutlineCog,
    HiOutlineCube,
    HiTrash,
} from 'react-icons/hi'
import { TbEyeCheck } from 'react-icons/tb'
import CreateNewModuleForm from './Forms/CreateNewModuleForm'
import ShowPopupOnClick from '@/views/components/Layout/ShowPopupOnClick'
import { useDialogContext } from '@/providers/DialogProvider'
import IDE from '@/views/IDE'
import { useAppServiceStore } from '@/stores/ServiceStore'
import { useEntityStore } from '@/stores/useEntityStore'
import { useSessionUser } from '@/stores/authStore'
import { useState } from 'react'
const ModulesView = ({ goTo }: any) => {
    const module = useModuleStore((s) => s.module)
    const modules = useModuleStore((s) => s.modules)
    const setModule = useModuleStore((s) => s.setModule)
    const setServices = useAppServiceStore((s) => s.setServices)
    const setEntities = useEntityStore((s) => s.setEntities)
    const { configDialog } = useDialogContext()
    const user = useSessionUser((state) => state.user)
    const setUser = useSessionUser((state) => state.setUser)
    const setSetting = useSessionUser((state) => state.setSetting)
    const [loading, setLoading] = useState<any>({})
    const submitNewModuleForm = (res: any) => {
        if (!res.error) {
            modules.unshift(res.module)
            useModuleStore.getState().setModules(modules)
            configDialog({ isOpen: false })
        }
    }

    const changeModule = async (mod: any) => {
        user.currentSetting!.moduleId! = mod.id
        setUser(user)
        setLoading((prev: any) => ({ ...prev, [mod.id]: true }))
        await setSetting()
        setLoading((prev: any) => ({ ...prev, [mod.id]: false }))
        setServices([])
        setEntities([])
        setModule(mod)
        goTo(mod.name)
    }

    return (
        <div>
            <DambaHeader name={'Modules'}>
                <ShowPopupOnClick
                    title={'Add New Module'}
                    btnText={'Add Module'}
                >
                    <CreateNewModuleForm onSubmit={submitNewModuleForm} />
                </ShowPopupOnClick>
            </DambaHeader>

            <div className="mt-8 grid grid-cols-22 gap-4">
                {/* LEFT (col-4) */}
                <aside className="col-span-22 lg:col-span-6 ">
                    {modules.map((project) => (
                        <Card key={project.id} className="mb-2">
                            <div className="flex w-full items-center justify-between gap-3">
                                {/* Left: icon + texts */}
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700">
                                        <HiOutlineCube className="text-xl" />
                                    </div>

                                    <div className="min-w-0">
                                        <h6
                                            className={classNames(
                                                'm-0 truncate font-semibold hover:text-primary',
                                                project.id == module?.id
                                                    ? 'text-primary'
                                                    : '',
                                            )}
                                        >
                                            {project.name}
                                        </h6>
                                        <p className="m-0 truncate text-xs text-gray-500 dark:text-gray-400">
                                            {project.description}
                                        </p>
                                    </div>
                                </div>
                                {/* Right: 3 buttons */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        shape="circle"
                                        size="xs"
                                        variant="default"
                                        icon={<HiOutlineCog />}
                                        aria-label="Module settings"
                                        title="Module settings"
                                        onClick={() => {
                                            goTo(SidebarMenuKey.Setting)
                                        }}
                                    />
                                    {project.id != module?.id ? (
                                        <>
                                            {' '}
                                            <Button
                                                shape="circle"
                                                size="xs"
                                                variant="default"
                                                icon={<HiOutlineCheckCircle />}
                                                aria-label="Set active module"
                                                title="Set active module"
                                                loading={loading[project!.id!]}
                                                onClick={async () => {
                                                    changeModule(project)
                                                }}
                                            />
                                            <Button
                                                shape="circle"
                                                size="xs"
                                                variant="default"
                                                icon={<HiTrash />}
                                                aria-label="Set active module"
                                                title="Set active module"
                                                onClick={async () => {}}
                                            />
                                        </>
                                    ) : (
                                        <Button
                                            shape="circle"
                                            size="xs"
                                            variant="solid"
                                            icon={<TbEyeCheck />}
                                            aria-label="Favorite"
                                            title="Favorite"
                                            onClick={() => {
                                                changeModule(module!)
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </aside>

                {/* RIGHT (col-18) */}
                <main className="col-span-22 lg:col-span-16 ">
                    <Card className="flex flex-col gap-4">
                        <IDE></IDE>
                    </Card>
                </main>
            </div>
        </div>
    )
}

export default ModulesView
