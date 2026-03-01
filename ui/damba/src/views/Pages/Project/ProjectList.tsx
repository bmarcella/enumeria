/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { HiOutlineCube, HiOutlineCheckCircle, HiTrash } from 'react-icons/hi'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectStore, selectProjects } from '@/stores/useProjectStore'
import Input from '@/components/ui/Input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import Alert from '@/components/ui/Alert'
import Form from '@/components/ui/Form/Form'
import FormItem from '@/components/ui/Form/FormItem'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSocket } from '@/providers/SocketProvider'
import {
    SocketAction,
    EntityType,
    ServiceName,
} from '../../../../../../common/Damba/core/Socket'
import { useSessionUser } from '@/stores/authStore'
import { useNavigate } from 'react-router'

type LoadingMap = Record<string, boolean>

export const projectSchema = z.object({
    description: z.string(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

export const ProjectList = () => {
    const projects = useProjectStore(selectProjects)
    const model = useMemo(() => 'Projects', [])
    const [loading, setLoading] = useState<LoadingMap>({})
    const [message, setMessage] = useTimeOutMessage()
    const { t } = useTranslation()
    const [saving, setSaving] = useState(false)
    const { socket, isConnected, OnMessage } = useSocket()
    const [msgs, setMsgs] = useState<string[]>([])
    const [prompt, setPrompt] = useState<string | undefined>(undefined) as any
    const setUser = useSessionUser((state) => state.setUser)
    const setSetting = useSessionUser((state) => state.setSetting)
    const setProject = useProjectStore((s) => s.setProject)
    const user = useSessionUser((state) => state.user)
    const navigate = useNavigate()
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            description:
                'Create a todo list app that allow user to manage his tasks. The app should have the following features:\n- Add a task with title and description\n- Edit a task\n- Delete a task\n- Mark a task as completed\n- View all tasks in a list',
        },
    })

    const changeProject = (id_project?: string) => {
        // clear user setting first (in case something syncs store from user)
        if (user) {
            setUser({
                ...user,
                currentSetting: {
                    ...user.currentSetting,
                    projId: id_project ?? '',
                },
            })
        }
        // then clear store selection
        setProject(id_project ?? '')
        navigate(id_project ? '/projects' : '/home')
    }

    const onSubmitProject = (data: ProjectFormValues) => {
        try {
            const prompt = data.description
            setSaving(true)
            setPrompt(prompt)
            const message_name = `${SocketAction.create(EntityType.PROJECT, ServiceName.SOCKET)}`
            console.log('Emitting message:', message_name, { prompt })
            OnMessage(message_name, { prompt })
        } catch (error) {
            console.error('Error submitting project:', error)
            setSaving(false)
            setPrompt(undefined)
        }
    }

    useEffect(() => {
        const handler = (m: string) => setMsgs((p) => [...p, m])
        socket.on('message', handler)
        return () => {
            socket.off('message', handler) // returns Socket, but we ignore it => cleanup returns void
        }
    }, [socket])

    return (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <aside className="lg:col-span-4">
                <Card
                    header={{
                        content: 'Available Projects',
                        bordered: true,
                    }}
                >
                    {projects.map((project) => {
                        const id = String(project.id)
                        const isLoading = !!loading[id]

                        return (
                            <Card key={id} className="mb-2 p-3">
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
                                        <Button
                                            variant="default"
                                            aria-label="Set active project"
                                            title="Set active project"
                                            disabled={isLoading}
                                            onClick={async () => {
                                                changeProject(project.id)
                                            }}
                                        >
                                            <HiOutlineCheckCircle />
                                        </Button>

                                        <Button
                                            variant="solid"
                                            aria-label={`Delete ${model}`}
                                            title={`Delete ${model}`}
                                            disabled={isLoading || !isConnected}
                                            onClick={async () => {
                                                try {
                                                    setLoading((prev) => ({
                                                        ...prev,
                                                        [id]: true,
                                                    }))
                                                    // delete project
                                                } finally {
                                                    setLoading((prev) => ({
                                                        ...prev,
                                                        [id]: false,
                                                    }))
                                                }
                                            }}
                                        >
                                            <HiTrash />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </Card>
            </aside>
            <main className="lg:col-span-8">
                {!prompt && (
                    <Card
                        className="p-4"
                        header={{
                            content: 'Create Project',
                            bordered: true,
                        }}
                    >
                        {message && (
                            <Alert showIcon className="mb-4" type="danger">
                                <span className="break-all">{message}</span>
                            </Alert>
                        )}

                        <div className="space-y-3">
                            <Form
                                onSubmit={handleSubmit(onSubmitProject)}
                                className="space-y-4 p-2"
                            >
                                {/* Description */}
                                <FormItem
                                    label={
                                        t('project.description') ??
                                        'Description'
                                    }
                                    invalid={!!errors.description}
                                    errorMessage={
                                        errors.description?.message as
                                            | string
                                            | undefined
                                    }
                                >
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                textArea
                                                value={field.value ?? ''} // avoid passing null
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ''
                                                            ? null
                                                            : e.target.value,
                                                    )
                                                }
                                            />
                                        )}
                                    />
                                </FormItem>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        variant="solid"
                                        loading={saving}
                                    >
                                        {saving
                                            ? (t('project.saving') ??
                                              'Saving...')
                                            : (t('project.save') ??
                                              'Save Project')}
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </Card>
                )}

                {prompt && <Card className="p-4"></Card>}
            </main>
        </div>
    )
}
