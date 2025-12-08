/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useModuleStore } from '@/stores/useModuleStore'
import classNames from '@/utils/classNames'
import {
    HiOutlineCheckCircle,
    HiOutlineCog,
    HiOutlineCube,
} from 'react-icons/hi'
import { TbEyeCheck } from 'react-icons/tb'
import DambaHeader from '../components/Layout/DambaHeader'
import { SidebarMenuKey } from '../components/Layout/SideBarDambaPure'

const ModulesView = ({ goTo }: any) => {
    const module = useModuleStore((s) => s.module)
    const modules = useModuleStore((s) => s.modules)

    return (
        <div>
            <DambaHeader name={'Modules'}></DambaHeader>

            <div className="mt-8">
                <div className="flex flex-col gap-4">
                    {modules.map((project) => (
                        <Card key={project.id}>
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
                                                project.id == module?.id &&
                                                    'text-primary',
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
                                    {project.id != module?.id ? (
                                        <Button
                                            shape="circle"
                                            size="xs"
                                            variant="default"
                                            icon={<HiOutlineCheckCircle />}
                                            aria-label="Set active module"
                                            title="Set active module"
                                            onClick={() => {
                                                // onActivate()
                                            }}
                                        />
                                    ) : (
                                        <Button
                                            shape="circle"
                                            size="xs"
                                            variant="default"
                                            icon={<TbEyeCheck />}
                                            aria-label="Favorite"
                                            title="Favorite"
                                            onClick={() => {
                                                goTo(module?.name || 'Module')
                                            }}
                                        />
                                    )}

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
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ModulesView
