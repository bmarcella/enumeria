/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DambaHeader from '../../components/Layout/DambaHeader'
import { useAppServiceStore } from '@/stores/ServiceStore'
import Card from '@/components/ui/Card'
import {
    HiOutlineCheckCircle,
    HiOutlineCog,
    HiOutlineCube,
} from 'react-icons/hi'
import classNames from 'classnames'
import Button from '@/components/ui/Button'
import { TbEyeCheck } from 'react-icons/tb'
import { SidebarMenuKey } from '../../components/Layout/SideBarDambaPure'
import IDE from '../../IDE'
import ShowPopupOnClick from '@/views/components/Layout/ShowPopupOnClick'
import CreateServiceForm from './Form/CreateServiceForm'

function ShowServices({ goTo }: { goTo: (key: string | any) => void }) {
    const service = useAppServiceStore((s) => s.service)
    const services = useAppServiceStore((s) => s.services)
    const submitNewForm = (res: any) => {}
    return (
        <>
            <DambaHeader name={'Services'}>
                <ShowPopupOnClick
                    title={'Add New Service'}
                    btnText={'Add Service'}
                >
                    <CreateServiceForm onSubmit={submitNewForm} />
                </ShowPopupOnClick>
            </DambaHeader>

            {/* 2-col layout: left col-4, right col-18 */}
            <div className="mt-8 grid grid-cols-22 gap-4">
                {/* LEFT (col-4) */}
                <aside className="col-span-22 lg:col-span-6">
                    {services.map((project) => (
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
                                                project.id == service?.id &&
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

                                {/* Right: buttons */}
                                <div className="flex items-center gap-1">
                                    {project.id != service?.id ? (
                                        <Button
                                            shape="circle"
                                            size="xs"
                                            variant="default"
                                            icon={<HiOutlineCheckCircle />}
                                            aria-label="Set active service"
                                            title="Set active service"
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
                                                goTo(service?.name || 'service')
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
                </aside>

                {/* RIGHT (col-18) */}
                <main className="col-span-22 lg:col-span-16 ">
                    <Card className="flex flex-col gap-4">
                        <IDE></IDE>
                    </Card>
                </main>
            </div>
        </>
    )
}

export default ShowServices
