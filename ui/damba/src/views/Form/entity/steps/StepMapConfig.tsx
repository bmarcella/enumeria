// canvas-box/steps/StepMapConfig.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input, Checkbox } from '@/components/ui';
import { Field, Section } from '../CanvasBoxFormLayout';
import { CanvasBoxFormValues } from '../canvasBoxSchema';

const StepMapConfig: React.FC = () => {
const { control } = useFormContext<CanvasBoxFormValues>();

  return (
    <Section title="Step 2 - Mapping / Persistence (optional)">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Table name">
          <Controller
            name="mapConfig.tableName"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Field>

        <Field label="Schema">
          <Controller
            name="mapConfig.schema"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Field>

        <Field label="Namespace">
          <Controller
            name="mapConfig.namespace"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Field>

        <Field label="Plural name">
          <Controller
            name="mapConfig.pluralName"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Field>

        <Field label="Soft delete">
          <Controller
            name="mapConfig.softDelete"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox checked={!!field.value} onChange={field.onChange} />
                <span className="text-xs text-muted-foreground">
                  Enable @DeleteDateColumn
                </span>
              </div>
            )}
          />
        </Field>

        <Field label="Versioned">
          <Controller
            name="mapConfig.versioned"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox checked={!!field.value} onChange={field.onChange} />
                <span className="text-xs text-muted-foreground">
                  Enable optimistic locking
                </span>
              </div>
            )}
          />
        </Field>

        <Field label="Generate API">
          <Controller
            name="mapConfig.generateApi"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox checked={!!field.value} onChange={field.onChange} />
                <span className="text-xs text-muted-foreground">
                  Include in API generator
                </span>
              </div>
            )}
          />
        </Field>

        <Field label="Generate CRUD UI">
          <Controller
            name="mapConfig.generateCrud"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox checked={!!field.value} onChange={field.onChange} />
                <span className="text-xs text-muted-foreground">
                  Generate default CRUD screens
                </span>
              </div>
            )}
          />
        </Field>
      </div>
    </Section>
  );
};

export default StepMapConfig;
