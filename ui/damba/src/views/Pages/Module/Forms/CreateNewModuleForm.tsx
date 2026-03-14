/* eslint-disable @typescript-eslint/no-explicit-any */
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Alert, Button, Form, FormItem, Input } from '@/components/ui'
import { saveModule } from '@/services/module'

export const ModuleSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
})

export type ModuleFormValues = z.infer<typeof ModuleSchema>

interface ModuleFormProps {
    defaultValues?: Partial<ModuleFormValues>
    onSubmit: (res: any) => void
    onCancel?: () => void
}

function CreateNewModuleForm({
    defaultValues,
    onSubmit,
    onCancel,
}: ModuleFormProps) {
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useTimeOutMessage()
    const { t } = useTranslation()
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ModuleFormValues>({
        resolver: zodResolver(ModuleSchema),
        defaultValues: {
            name: '',
            description: '',
            ...defaultValues,
        },
    })

    const onSubmitForm = (data: ModuleFormValues) => {
        setSaving(true)
        saveModule(data)
            .then((res: any) => {
                setSaving(false)
                onSubmit?.({
                    error: false,
                    module: res,
                })
            })
            .catch((error) => {
                console.log(error)
                setMessage(
                    error?.response?.data?.message || 'Error saving module',
                )
                setSaving(false)
                onSubmit?.({ error: true })
            })
    }

    return (
        <>
            {' '}
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <Form
                onSubmit={handleSubmit(onSubmitForm)}
                className="space-y-4 p-2"
            >
                {/* Name */}
                <FormItem
                    label={t('module.name', 'Module Name')}
                    invalid={!!errors.name}
                    errorMessage={errors.name?.message}
                >
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                    />
                </FormItem>

                {/* Description */}
                <FormItem
                    label={t('project.description', 'Description')}
                    invalid={!!errors.description}
                    errorMessage={
                        errors.description?.message as string | undefined
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
                    {onCancel && (
                        <Button
                            type="button"
                            variant="plain"
                            onClick={onCancel}
                        >
                            {t('common.cancel') ?? 'Cancel'}
                        </Button>
                    )}
                    <Button type="submit" variant="solid" loading={saving}>
                        {saving
                            ? (t('project.saving') ?? 'Saving...')
                            : (t('project.save') ?? 'Save')}
                    </Button>
                </div>
            </Form>
        </>
    )
}

export default CreateNewModuleForm
