/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Form, FormItem, Input, Button, Select, Card } from '@/components/ui'
import { BehaviorFormSchema } from './BehaviorFormSchema'
import { Middleware } from '../../../../../../../common/Entity/behavior'

export type BehaviorFormValues = z.infer<typeof BehaviorFormSchema>

type Props = {
    defaultValues?: Partial<BehaviorFormValues>
    onSubmit: (payload: BehaviorFormValues) => void | Promise<void>
    onCancel?: () => void
    saving?: boolean
    middlewares: Middleware[]
}

export default function AddBehaviorForm({
    defaultValues,
    middlewares = [],
    onSubmit,
    onCancel,
    saving = false,
}: Props) {
    const middlewareOptions = useMemo(
        () =>
            middlewares
                .filter((m: any) => !!m.id)
                .map((m: any) => ({ value: m.id as string, label: m.name })),
        [middlewares],
    )

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<BehaviorFormValues>({
        resolver: zodResolver(BehaviorFormSchema),
        defaultValues: {
            name: '',
            method: Http.GET,
            path: '/',
            ...defaultValues,
        },
    })

    const method = watch('method')

    return (
        <Card className="p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="text-lg font-semibold">Add Behavior</div>
                    <div className="text-xs opacity-60">
                        Define the route + attach middlewares + extras
                    </div>
                </div>
            </div>

            <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Top row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormItem
                        label="Name"
                        invalid={!!errors.name}
                        errorMessage={errors.name?.message}
                    >
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <Input {...field} />}
                        />
                    </FormItem>

                    <FormItem
                        label="Method"
                        invalid={!!errors.method}
                        errorMessage={errors.method?.message}
                    >
                        <Controller
                            name="method"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={[
                                        { value: 'GET', label: 'GET' },
                                        { value: 'POST', label: 'POST' },
                                        { value: 'PUT', label: 'PUT' },
                                        { value: 'DELETE', label: 'DELETE' },
                                        { value: 'PATCH', label: 'PATCH' },
                                    ]}
                                    value={{
                                        value: field.value,
                                        label: field.value,
                                    }}
                                    onChange={(opt: any) =>
                                        field.onChange(opt?.value as Http)
                                    }
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem
                        label="Path"
                        invalid={!!errors.path}
                        errorMessage={errors.path?.message}
                    >
                        <Controller
                            name="path"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="/users/:id"
                                    prefix={`${method} `}
                                    value={field.value ?? ''}
                                    onChange={(e: any) =>
                                        field.onChange(e.target.value)
                                    }
                                />
                            )}
                        />
                    </FormItem>
                </div>

                {/* Middlewares */}
                <FormItem
                    label="Middlewares"
                    invalid={!!errors.middlewareIds}
                    errorMessage={(errors.middlewareIds as any)?.message}
                >
                    <Controller
                        name="middlewareIds"
                        control={control}
                        render={({ field }) => (
                            <Select
                                isMulti
                                placeholder="Select middlewares"
                                options={middlewareOptions}
                                value={middlewareOptions.filter((o) =>
                                    (field.value ?? []).includes(o.value),
                                )}
                                onChange={(opts: any[]) =>
                                    field.onChange(
                                        (opts ?? []).map((o) => o.value),
                                    )
                                }
                            />
                        )}
                    />
                    <div className="text-xs opacity-60 mt-1">
                        These should match existing middleware records
                        (Many-to-Many).
                    </div>
                </FormItem>

                {/* Extras */}
                <div className="rounded-xl border p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium">Extras</div>
                            <div className="text-xs opacity-60">
                                Saved as child records (One-to-Many)
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => append({ name: '', value: '' })}
                        >
                            + Add extra
                        </Button>
                    </div>

                    {fields.length === 0 ? (
                        <div className="text-sm opacity-60 mt-3">
                            No extras yet.
                        </div>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {fields.map((f, idx) => (
                                <div
                                    key={f.id}
                                    className="grid grid-cols-12 gap-2 items-center"
                                >
                                    <div className="col-span-5">
                                        <FormItem
                                            label={idx === 0 ? 'Name' : ''}
                                            invalid={
                                                !!errors.extras?.[idx]?.name
                                            }
                                            errorMessage={
                                                errors.extras?.[idx]?.name
                                                    ?.message
                                            }
                                        >
                                            <Controller
                                                name={`extras.${idx}.name`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g. requireAuth"
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    </div>

                                    <div className="col-span-6">
                                        <FormItem
                                            label={idx === 0 ? 'Value' : ''}
                                            invalid={
                                                !!errors.extras?.[idx]?.value
                                            }
                                            errorMessage={
                                                errors.extras?.[idx]?.value
                                                    ?.message as any
                                            }
                                        >
                                            <Controller
                                                name={`extras.${idx}.value`}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="e.g. true"
                                                    />
                                                )}
                                            />
                                        </FormItem>
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="default"
                                            onClick={() => remove(idx)}
                                        >
                                            ✕
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="plain"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" variant="solid" loading={!!saving}>
                        {saving ? 'Saving...' : 'Save Behavior'}
                    </Button>
                </div>
            </Form>
        </Card>
    )
}
