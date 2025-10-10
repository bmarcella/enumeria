/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFieldArray, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormItem, Input, Select, Checkbox, Button } from '@/components/ui'
import type { CanvasBox } from '@/models/CanvasBox'
import type { CanvasBoxAtributes } from '@/models/CanvasBoxAtributes'

type Option = { value: string; label: string }

const visibilityOptions: Option[] = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'protected', label: 'Protected' },
    { value: 'implementation', label: 'Implementation' },
]

const statusOptions: Option[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'deprecated', label: 'Deprecated' },
]

const classificationOptions: Option[] = [
    { value: 'public', label: 'Public' },
    { value: 'internal', label: 'Internal' },
    { value: 'restricted', label: 'Restricted' },
    { value: 'confidential', label: 'Confidential' },
]

const ormOptions: Option[] = [
    { value: 'typeorm', label: 'TypeORM' },
    { value: 'prisma', label: 'Prisma' },
    { value: 'sequelize', label: 'Sequelize' },
]

/* --------------------------------- Zod --------------------------------- */

const IndexSchema = z.object({
    name: z.string().optional(),
    columns: z.array(z.string().min(1, 'Required')).min(1, 'At least 1 column'),
    unique: z.boolean().optional(),
})

const CanvasBoxSchema = z.object({
    id: z.string().min(1, 'Required'),
    entityName: z.string().min(1, 'Required'),
    stereotype: z.string().optional(),

    ownerId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['draft', 'active', 'deprecated']).optional(),

    tableName: z.string().optional(),
    schema: z.string().optional(),
    namespace: z.string().optional(),
    pluralName: z.string().optional(),
    slug: z.string().optional(),
    softDelete: z.boolean().optional(),
    versioned: z.boolean().optional(),
    uniqueConstraints: z.array(z.array(z.string().min(1))).optional(),
    indexes: z.array(IndexSchema).optional(),

    classification: z.enum(['public', 'internal', 'restricted', 'confidential']).optional(),
    rules: z.record(z.any()).optional(),

    orm: z.enum(['typeorm', 'prisma', 'sequelize']).optional(),
    generateApi: z.boolean().optional(),
    generateCrud: z.boolean().optional(),

    extendsId: z.string().optional(),
    mixins: z.array(z.string()).optional(),

    visibility: z.enum(['public', 'private', 'protected', 'implementation']),
    isAbstract: z.boolean().optional(),
    isAuth: z.boolean().optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
    locked: z.boolean().optional(),
    selected: z.boolean().optional(),
    zIndex: z.number().optional(),

    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),

    attributes: z.array(z.any()).optional(), // you can replace with your CanvasBoxAtributes schema

    username: z.array(z.string()).optional(),
    password: z.string().optional(),
})

export type CanvasBoxFormValues = z.infer<typeof CanvasBoxSchema>

type Props = {
    existingEntities?: { id: string; entityName: string }[]
    defaultValues?: Partial<CanvasBoxFormValues>
    onSubmitBox: (data: CanvasBoxFormValues) => Promise<void> | void
    onCancel?: () => void
}

export default function AddCanvasBoxForm({
    existingEntities = [],
    defaultValues,
    onSubmitBox,
    onCancel,
}: Props) {
    const entityOptions: Option[] = existingEntities.map(e => ({ value: e.id, label: e.entityName }))

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<CanvasBoxFormValues>({
        resolver: zodResolver(CanvasBoxSchema),
        defaultValues: {
            id: '',
            entityName: '',
            visibility: 'public',
            tags: [],
            uniqueConstraints: [],
            indexes: [],
            ...defaultValues,
        },
    })

    // Unique constraints as array of arrays
    const { fields: ucFields, append: ucAppend, remove: ucRemove } = useFieldArray({
        control,
        name: 'uniqueConstraints' as const,
    })

    // Indexes
    const { fields: idxFields, append: idxAppend, remove: idxRemove } = useFieldArray({
        control,
        name: 'indexes' as const,
    })

    const onSubmit = async (data: CanvasBoxFormValues) => {
        // Ensure empty strings become undefined where appropriate
        const cleaned: CanvasBoxFormValues = {
            ...data,
            tableName: emptyToUndef(data.tableName),
            schema: emptyToUndef(data.schema),
            namespace: emptyToUndef(data.namespace),
            pluralName: emptyToUndef(data.pluralName),
            slug: emptyToUndef(data.slug),
            extendsId: emptyToUndef(data.extendsId),
            icon: emptyToUndef(data.icon),
            color: emptyToUndef(data.color),
        }
        await onSubmitBox(cleaned)
    }

    return (
        <div className="w-full bg-gray-50 dark:bg-gray-800 rounded p-4 shadow">
            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Identity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormItem label="ID" invalid={!!errors.id} errorMessage={errors.id?.message}>
                        <Controller name="id" control={control} render={({ field }) => <Input {...field} />} />
                    </FormItem>
                    <FormItem label="Entity name" invalid={!!errors.entityName} errorMessage={errors.entityName?.message}>
                        <Controller name="entityName" control={control} render={({ field }) => <Input {...field} />} />
                    </FormItem>
                    <FormItem label="Stereotype">
                        <Controller name="stereotype" control={control} render={({ field }) => <Input {...field} />} />
                    </FormItem>
                </div>

                {/* Ownership / Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormItem label="Owner ID">
                        <Controller name="ownerId" control={control} render={({ field }) => <Input {...field} />} />
                    </FormItem>
                    <FormItem label="Status">
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={statusOptions}
                                    value={statusOptions.find(o => o.value === field.value) ?? null}
                                    onChange={(o: Option | null) => field.onChange(o?.value)}
                                    placeholder="Select status"
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label="Tags (comma separated)">
                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    value={(field.value ?? []).join(', ')}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value
                                                .split(',')
                                                .map(s => s.trim())
                                                .filter(Boolean)
                                        )
                                    }
                                    placeholder="e.g. auth, core"
                                />
                            )}
                        />
                    </FormItem>
                </div>

                {/* Persistence & Mapping */}
                <div className="mt-6">
                    <div className="text-xs opacity-70 mb-2">Persistence & Mapping</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormItem label="Table name">
                            <Controller name="tableName" control={control} render={({ field }) => <Input {...field} />} />
                        </FormItem>
                        <FormItem label="Schema">
                            <Controller name="schema" control={control} render={({ field }) => <Input {...field} />} />
                        </FormItem>
                        <FormItem label="Namespace">
                            <Controller name="namespace" control={control} render={({ field }) => <Input {...field} />} />
                        </FormItem>
                        <FormItem label="Plural name">
                            <Controller name="pluralName" control={control} render={({ field }) => <Input {...field} />} />
                        </FormItem>
                        <FormItem label="Slug">
                            <Controller name="slug" control={control} render={({ field }) => <Input {...field} />} />
                        </FormItem>
                        <FormItem label="ORM">
                            <Controller
                                name="orm"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        options={ormOptions}
                                        value={ormOptions.find(o => o.value === field.value) ?? null}
                                        onChange={(o: Option | null) => field.onChange(o?.value)}
                                        placeholder="Select ORM"
                                    />
                                )}
                            />
                        </FormItem>
                        <FormItem label="Soft Delete">
                            <Controller name="softDelete" control={control} render={({ field }) => <Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />} />
                        </FormItem>
                        <FormItem label="Versioned">
                            <Controller name="versioned" control={control} render={({ field }) => <Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />} />
                        </FormItem>
                        <FormItem label="Generate API">
                            <Controller name="generateApi" control={control} render={({ field }) => <Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />} />
                        </FormItem>
                        <FormItem label="Generate CRUD">
                            <Controller name="generateCrud" control={control} render={({ field }) => <Checkbox checked={!!field.value} onChange={e => field.onChange(e.target.checked)} />} />
                        </FormItem>
                    </div>

                    {/* Unique constraints */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Unique Constraints</span>
                            <Button size="sm" variant="twoTone" onClick={() => ucAppend([''])}>Add Constraint</Button>
                        </div>
                        {ucFields.length === 0 ? (
                            <div className="text-xs opacity-60">No unique constraints.</div>
                        ) : (
                            <div className="space-y-3">
                                {ucFields.map((uc, i) => (
                                    <div key={uc.id} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-11">
                                            <Controller
                                                name={`uniqueConstraints.${i}` as const}
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        placeholder="Comma-separated columns, e.g. email or firstName,lastName"
                                                        value={(field.value ?? []).join(', ')}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value
                                                                    .split(',')
                                                                    .map(s => s.trim())
                                                                    .filter(Boolean)
                                                            )
                                                        }
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <Button size="sm" variant="plain" onClick={() => ucRemove(i)}>Remove</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Indexes */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Indexes</span>
                            <Button
                                size="sm"
                                variant="twoTone"
                                onClick={() => idxAppend({ name: '', columns: [''], unique: false })}
                            >
                                Add Index
                            </Button>
                        </div>
                        {idxFields.length === 0 ? (
                            <div className="text-xs opacity-60">No indexes.</div>
                        ) : (
                            <div className="space-y-3">
                                {idxFields.map((idx, i) => (
                                    <div key={idx.id} className="grid grid-cols-12 gap-2 items-center">
                                        <div className="col-span-3">
                                            <FormItem label="Name">
                                                <Controller
                                                    name={`indexes.${i}.name` as const}
                                                    control={control}
                                                    render={({ field }) => <Input {...field} placeholder="idx_users_email" />}
                                                />
                                            </FormItem>
                                        </div>
                                        <div className="col-span-7">
                                            <FormItem label="Columns">
                                                <Controller
                                                    name={`indexes.${i}.columns` as const}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            placeholder="Comma-separated columns"
                                                            value={(field.value ?? []).join(', ')}
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target.value
                                                                        .split(',')
                                                                        .map(s => s.trim())
                                                                        .filter(Boolean)
                                                                )
                                                            }
                                                        />
                                                    )}
                                                />
                                            </FormItem>
                                        </div>
                                        <div className="col-span-1">
                                            <FormItem label="Unique">
                                                <Controller
                                                    name={`indexes.${i}.unique` as const}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />
                                                    )}
                                                />
                                            </FormItem>
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <Button size="sm" variant="plain" onClick={() => idxRemove(i)}>Remove</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Security & Validation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <FormItem label="Classification">
                        <Controller
                            name="classification"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={classificationOptions}
                                    value={classificationOptions.find(o => o.value === field.value) ?? null}
                                    onChange={(o: Option | null) => field.onChange(o?.value)}
                                    placeholder="Select classification"
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label="Rules (JSON)">
                        <Controller
                            name="rules"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    as="textarea"
                                    rows={3}
                                    placeholder='{"minAge":18}'
                                    value={field.value ? JSON.stringify(field.value) : ''}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(e.target.value)
                                            field.onChange(parsed)
                                        } catch {
                                            field.onChange(e.target.value) // keep raw; your save handler can validate
                                        }
                                    }}
                                />
                            )}
                        />
                    </FormItem>
                </div>

                {/* Inheritance / Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <FormItem label="Extends">
                        <Controller
                            name="extendsId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={[{ value: '', label: '— none —' }, ...entityOptions]}
                                    value={entityOptions.find(o => o.value === field.value) ?? null}
                                    onChange={(o: Option | null) => field.onChange(o?.value || undefined)}
                                    placeholder="— none —"
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label="Mixins (comma separated)">
                        <Controller
                            name="mixins"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    value={(field.value ?? []).join(', ')}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                        )
                                    }
                                    placeholder="e.g. Timestamps, Sluggable"
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label="Visibility" invalid={!!errors.visibility} errorMessage={errors.visibility?.message}>
                        <Controller
                            name="visibility"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={visibilityOptions}
                                    value={visibilityOptions.find(o => o.value === field.value) ?? null}
                                    onChange={(o: Option | null) => field.onChange(o?.value)}
                                    placeholder="Select visibility"
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem label="Abstract">
                        <Controller name="isAbstract" control={control} render={({ field }) => <Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
                    </FormItem>
                    <FormItem label="Auth Entity">
                        <Controller name="isAuth" control={control} render={({ field }) => <Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
                    </FormItem>
                    <FormItem label="Color">
                        <Controller name="color" control={control} render={({ field }) => <Input type="text" placeholder="#3B82F6" {...field} />} />
                    </FormItem>
                    <FormItem label="Icon">
                        <Controller name="icon" control={control} render={({ field }) => <Input placeholder="e.g. user" {...field} />} />
                    </FormItem>
                    <FormItem label="Locked">
                        <Controller name="locked" control={control} render={({ field }) => <Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
                    </FormItem>
                    <FormItem label="Selected">
                        <Controller name="selected" control={control} render={({ field }) => <Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />} />
                    </FormItem>
                    <FormItem label="zIndex">
                        <Controller name="zIndex" control={control} render={({ field }) =>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />}
                        />
                    </FormItem>
                </div>

                {/* Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <FormItem label="x">
                        <Controller name="x" control={control} render={({ field }) =>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />} />
                    </FormItem>
                    <FormItem label="y">
                        <Controller name="y" control={control} render={({ field }) =>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />} />
                    </FormItem>
                    <FormItem label="width">
                        <Controller name="width" control={control} render={({ field }) =>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />} />
                    </FormItem>
                    <FormItem label="height">
                        <Controller name="height" control={control} render={({ field }) =>
                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />} />
                    </FormItem>
                </div>

                {/* Diagram creds (legacy) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <FormItem label="Username (comma separated)">
                        <Controller
                            name="username"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    value={(field.value ?? []).join(', ')}
                                    onChange={(e) =>
                                        field.onChange(
                                            e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                        )
                                    }
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem label="Password">
                        <Controller name="password" control={control} render={({ field }) => <Input type="password" {...field} />} />
                    </FormItem>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-2">
                    <Button type="submit" variant="solid" loading={isSubmitting}>Save</Button>
                    {onCancel && <Button variant="plain" onClick={onCancel}>Cancel</Button>}
                </div>
            </Form>
        </div>
    )
}

function emptyToUndef<T extends string | undefined>(v: T): T | undefined {
    return (v as any)?.trim?.() === '' ? undefined : v
}
