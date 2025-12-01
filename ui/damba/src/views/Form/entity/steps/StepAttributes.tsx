/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Card, Button, Input, Checkbox, Select } from '@/components/ui';
import { Field, Section } from '../CanvasBoxFormLayout';
import { CanvasBoxFormValues } from '../canvasBoxSchema';
import {
  VisibilityTypeAttributes,
  RelationshipType,
} from '../../../../../../../common/Entity/CanvasBox';
import { useEntityStore } from '@/stores/useEntityStore';

// ----------------------
// Helpers
// ----------------------

const typeOptions = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'date', label: 'date' },
  { value: 'enum', label: 'enum' },
  { value: 'relation', label: 'relation' },
  { value: 'json', label: 'json' },
];

const visibilityOptions = Object.values(VisibilityTypeAttributes).map((v) => ({
  value: v,
  label: v,
}));

const relationTypeOptions = Object.values(RelationshipType).map((value) => ({
  label: value.replace('@', ''),
  value,
}));

function typeBadgeColor(type?: string) {
  switch (type) {
    case 'string':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'number':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'boolean':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'date':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'enum':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'relation':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'json':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function generateTypeOrmSnippet(attr: any): string {
  const name = attr?.name || 'field';
  const type = attr?.type || 'string';

  if (type === 'relation' && attr?.relation?.type && attr?.relation?.targetEntity) {
    const relType = attr.relation.type.replace('@', '');
    const target = attr.relation.targetEntityName || 'TargetEntity';
    const cascade = attr.relation?.cascade ? ', { cascade: true }' : '';
    return `@${relType}(() => ${target}${cascade})\n${name}: ${target};`;
  }

  const nullable = !attr?.required;
  const options: string[] = [];

  if (type === 'string') options.push(`type: 'varchar'`);
  if (type === 'number') options.push(`type: 'int'`);
  if (type === 'boolean') options.push(`type: 'boolean'`);
  if (type === 'date') options.push(`type: 'timestamp'`);
  if (type === 'enum') options.push(`type: 'enum', enum: /* your enum */`);
  if (type === 'json') options.push(`type: 'jsonb'`);

  options.push(`nullable: ${nullable}`);

  if (attr?.unique) options.push(`unique: true`);

  const optionsStr = options.join(', ');

  return `@Column({ ${optionsStr} })\n${name}: ${type === 'number' ? 'number' : type === 'boolean' ? 'boolean' : 'string'};`;
}

// ----------------------
// RelationEditor
// ----------------------

interface RelationEditorProps {
  attributeIndex: number;
}

const RelationEditor: React.FC<RelationEditorProps> = ({ attributeIndex }) => {
  const { control, register, watch } = useFormContext<CanvasBoxFormValues>();
  const relation = watch(`attributes.${attributeIndex}.relation`);
  const entities = useEntityStore((s) => s.entities);

  const entityOptions = useMemo(
    () =>
      entities.map((e) => ({
        value: e.id,
        label: e.entityName,
      })),
    [entities],
  );

  const selectedEntity = entities.find((e) => e.id === relation?.targetEntity);
  const targetAttributeOptions =
    selectedEntity?.attributes?.map((att: any) => ({
      value: att.name,
      label: att.name,
    })) ?? [];

  return (
    <Card className="mt-4 p-3 border bg-gray-50 space-y-3">
      <div className="font-medium text-sm mb-1">Relation</div>

      {/* Relation Type */}
      <div>
        <label className="text-xs font-semibold mb-1 block">Relation type</label>
        <Controller
          control={control}
          name={`attributes.${attributeIndex}.relation.type` as const}
          render={({ field }) => (
            <Select
              options={relationTypeOptions}
              value={relationTypeOptions.find((o) => o.value === field.value) || null}
              onChange={(opt: any) => field.onChange(opt?.value)}
            />
          )}
        />
      </div>

      {/* Target Entity */}
      <div>
        <label className="text-xs font-semibold mb-1 block">Target entity</label>
        <Controller
          control={control}
          name={`attributes.${attributeIndex}.relation.targetEntity` as const}
          render={({ field }) => (
            <Select
              options={entityOptions}
              value={entityOptions.find((o) => o.value === field.value) || null}
              onChange={(opt: any) => field.onChange(opt?.value)}
            />
          )}
        />
      </div>

      {/* Target Attribute */}
      {selectedEntity && (
        <div>
          <label className="text-xs font-semibold mb-1 block">Target attribute</label>
          <Controller
            control={control}
            name={`attributes.${attributeIndex}.relation.targetEntityAttribute` as const}
            render={({ field }) => (
              <Select
                options={targetAttributeOptions}
                value={targetAttributeOptions.find((o) => o.value === field.value) || null}
                onChange={(opt: any) => field.onChange(opt?.value)}
              />
            )}
          />
        </div>
      )}

      {/* Join column (for many-to-one / one-to-one) */}
      {(relation?.type === RelationshipType.MANY_TO_ONE ||
        relation?.type === RelationshipType.ONE_TO_ONE) && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold mb-1 block">Join column name</label>
            <Input
              placeholder="e.g. userId"
              {...register(
                `attributes.${attributeIndex}.relation.columnToJoin.name` as const,
              )}
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">
              Referenced column
            </label>
            <Input
              placeholder="e.g. id"
              {...register(
                `attributes.${attributeIndex}.relation.columnToJoin.referencedColumnName` as const,
              )}
            />
          </div>
        </div>
      )}

      {/* OnDelete / OnUpdate */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold mb-1 block">On delete</label>
          <Controller
            control={control}
            name={`attributes.${attributeIndex}.relation.onDelete` as const}
            render={({ field }) => (
              <Select
                options={[
                  { label: 'CASCADE', value: 'CASCADE' },
                  { label: 'SET NULL', value: 'SET NULL' },
                  { label: 'RESTRICT', value: 'RESTRICT' },
                ]}
                value={
                  ['CASCADE', 'SET NULL', 'RESTRICT']
                    .map((v) => ({ label: v, value: v }))
                    .find((o) => o.value === field.value) || null
                }
                onChange={(opt: any) => field.onChange(opt?.value)}
              />
            )}
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block">On update</label>
          <Controller
            control={control}
            name={`attributes.${attributeIndex}.relation.onUpdate` as const}
            render={({ field }) => (
              <Select
                options={[
                  { label: 'CASCADE', value: 'CASCADE' },
                  { label: 'SET NULL', value: 'SET NULL' },
                  { label: 'RESTRICT', value: 'RESTRICT' },
                ]}
                value={
                  ['CASCADE', 'SET NULL', 'RESTRICT']
                    .map((v) => ({ label: v, value: v }))
                    .find((o) => o.value === field.value) || null
                }
                onChange={(opt: any) => field.onChange(opt?.value)}
              />
            )}
          />
        </div>
      </div>
    </Card>
  );
};

// ----------------------
// AttributeCard
// ----------------------

interface AttributeCardProps {
  index: number;
  selected: boolean;
  onClick: () => void;
  data: any;
  onRemove: () => void;
}

const AttributeCard: React.FC<AttributeCardProps> = ({
  index,
  selected,
  onClick,
  data,
  onRemove,
}) => {
  const type = data?.type || 'string';
  const required = data?.required;
  const unique = data?.unique;
  const isId = data?.isId;
  const isRelation = data?.type === 'relation';

  return (
    <Card
      onClick={onClick}
      className={`border cursor-pointer transition-all ${
        selected ? 'border-primary shadow-sm bg-primary/5' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <div>
          <div className="text-sm font-semibold">
              {data?.name || `field_${index + 1}`}
          </div>
          <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
            <span
              className={`inline-flex px-2 py-0.5 rounded-full border ${typeBadgeColor(
                type,
              )}`}
            >
              {type}
            </span>
            {required && (
              <span className="inline-flex px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                required
              </span>
            )}
            {unique && (
              <span className="inline-flex px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                unique
              </span>
            )}
            {isId && (
              <span className="inline-flex px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                id
              </span>
            )}
            {isRelation && (
              <span className="inline-flex px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                relation
              </span>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ✕
        </Button>
      </div>
    </Card>
  );
};

// ----------------------
// AttributeInspector
// ----------------------

interface AttributeInspectorProps {
  index: number;
}

const AttributeInspector: React.FC<AttributeInspectorProps> = ({ index }) => {
  const { control, register, watch } = useFormContext<CanvasBoxFormValues>();
  const attr = watch(`attributes.${index}`);

  if (!attr) {
    return (
      <Card className="p-4 border h-full flex items-center justify-center text-sm text-muted-foreground">
        Select an attribute on the left to edit its details.
      </Card>
    );
  }

  const snippet = generateTypeOrmSnippet(attr);

  return (
    <div className="space-y-4">
      <Card className="p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Name */}
          <Field label="Field name">
            <Input
              {...register(`attributes.${index}.name` as const)}
              placeholder="e.g. title"
            />
          </Field>

          {/* Type */}
          <Field label="Type">
            <Controller
              control={control}
              name={`attributes.${index}.type` as const}
              render={({ field }) => (
                <Select
                  options={typeOptions}
                  value={typeOptions.find((o) => o.value === field.value) || null}
                  onChange={(opt: any) => field.onChange(opt?.value)}
                />
              )}
            />
          </Field>

          {/* Visibility */}
          <Field label="Visibility">
            <Controller
              control={control}
              name={`attributes.${index}.visibility` as const}
              render={({ field }) => (
                <Select
                  options={visibilityOptions}
                  value={
                    visibilityOptions.find((o) => o.value === field.value) || null
                  }
                  onChange={(opt: any) => field.onChange(opt?.value)}
                />
              )}
            />
          </Field>

          {/* Default value */}
          <Field label="Default value">
            <Input
              {...register(`attributes.${index}.default` as const)}
              placeholder="e.g. 0, true, 'N/A'"
            />
          </Field>

          {/* Required / Nullable / Unique / ID / Generated / Array */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <label className="flex items-center gap-2 text-xs">
              <Checkbox
                {...register(`attributes.${index}.required` as const)}
                checked={!!attr.required}
                onChange={(e: any) =>
                  attr && (attr.required = e.target.checked)
                }
              />
              <span>Required (UI)</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox
                {...register(`attributes.${index}.nullable` as const)}
                checked={!!attr.nullable}
                onChange={(e: any) =>
                  attr && (attr.nullable = e.target.checked)
                }
              />
              <span>Nullable (DB)</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox
                {...register(`attributes.${index}.unique` as const)}
                checked={!!attr.unique}
                onChange={(e: any) => (attr.unique = e.target.checked)}
              />
              <span>Unique</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox
                {...register(`attributes.${index}.isId` as const)}
                checked={!!attr.isId}
                onChange={(e: any) => (attr.isId = e.target.checked)}
              />
              <span>Primary key</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox
                {...register(`attributes.${index}.isGenerateAuto` as const)}
                checked={!!attr.isGenerateAuto}
                onChange={(e: any) =>
                  (attr.isGenerateAuto = e.target.checked)
                }
              />
              <span>Generated</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox
                {...register(`attributes.${index}.isArray` as const)}
                checked={!!attr.isArray}
                onChange={(e: any) => (attr.isArray = e.target.checked)}
              />
              <span>Array</span>
            </label>
          </div>

          {/* Min / Max */}
          <Field label="Min (number)">
            <Input
              type="number"
              {...register(`attributes.${index}.min` as const)}
            />
          </Field>
          <Field label="Max (number)">
            <Input
              type="number"
              {...register(`attributes.${index}.max` as const)}
            />
          </Field>
        </div>
      </Card>

      {/* Relation editor if needed */}
      {attr.type === 'relation' && (
        <RelationEditor attributeIndex={index} />
      )}

      {/* TypeORM snippet preview */}
      <Card className="p-1 border bg-slate-950 text-slate-50 text-xs font-mono whitespace-pre overflow-x-auto">
        {snippet}
      </Card>
    </div>
  );
};

// ----------------------
// StepAttributes (main export)
// ----------------------

const StepAttributes: React.FC = () => {
  const { control, watch } = useFormContext<CanvasBoxFormValues>();
  const { fields, append, remove } = useFieldArray({
    name: 'attributes',
    control,
  });

  const attributes = watch('attributes') || [];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    fields.length > 0 ? 0 : null,
  );

  const handleAddAttribute = (type: string) => {
    const newIndex = fields.length;
    append({
      name: '',
      type,
      visibility: VisibilityTypeAttributes.PUBLIC,
      required: false,
      nullable: true,
      isMapped: true,
    } as any);
    setSelectedIndex(newIndex);
  };

  return (
    <Section title="Step 4 - Attributes (developer friendly)">
      <div className="flex flex-col md:flex-row gap-4">
        {/* LEFT: List + palette */}
        <div className="w-full md:w-1/3 space-y-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {typeOptions.map((t) => (
              <Button
                key={t.value}
                type="button"
                variant="solid"
                size="sm"
                onClick={() => handleAddAttribute(t.value)}
              >
                + {t.label}
              </Button>
            ))}
          </div>

          <div className="space-y-1 max-h-[400px] overflow-y-auto ">
            {fields.map((f, idx) => (
              <AttributeCard
                key={f.id}
                index={idx}
                selected={selectedIndex === idx}
                onClick={() => setSelectedIndex(idx)}
                data={attributes[idx]}
                onRemove={() => {
                  remove(idx);
                  if (selectedIndex === idx) {
                    setSelectedIndex(null);
                  } else if ((selectedIndex ?? 0) > idx) {
                    setSelectedIndex((selectedIndex ?? 0) - 1);
                  }
                }}
              />
            ))}

            {fields.length === 0 && (
              <Card className="p-4 border text-xs text-muted-foreground">
                No attributes yet. Use the palette above to add your first
                field (e.g. <strong>string</strong>, <strong>number</strong>,
                or <strong>relation</strong>).
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT: Inspector */}
        <div className="w-full md:w-2/3">
          {selectedIndex !== null ? (
            <AttributeInspector index={selectedIndex} />
          ) : (
            <Card className="p-4 border h-full flex items-center justify-center text-sm text-muted-foreground">
              Select or create an attribute to configure its details.
            </Card>
          )}
        </div>
      </div>
    </Section>
  );
};

export default StepAttributes;
