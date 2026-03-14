/* eslint-disable react/jsx-sort-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { ModuleSchema } from '../../Module/Forms/CreateNewModuleForm'
import { saveService } from '@/services/Service'
import { Alert, Button, Form, FormItem, Input } from '@/components/ui'

export const ObjSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
})

export type ServiceFormValues = z.infer<typeof ObjSchema>

interface CreateServiceFormProps {
    // Define any props if needed
    // Define any props if needed
    defaultValues?: Partial<ServiceFormValues>
    onSubmit: (res: any) => void
    onCancel?: () => void
}
function CreateServiceForm({
    defaultValues,
    onSubmit,
    onCancel,
}: CreateServiceFormProps) {
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useTimeOutMessage()
    const { t } = useTranslation()
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ServiceFormValues>({
        resolver: zodResolver(ModuleSchema),
        defaultValues: {
            name: '',
            description: '',
            ...defaultValues,
        },
    })

    const onSubmitForm = (data: ServiceFormValues) => {
        setSaving(true)
        saveService(data)
            .then((res: any) => {
                setSaving(false)
                onSubmit?.({
                    error: false,
                    service: res,
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
                    label={t('service.name', 'Service Name')}
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
                    label={t('service.description', 'Description')}
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

export default CreateServiceForm
