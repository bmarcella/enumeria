// canvas-box/steps/StepMeta.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { Input, Button } from '@/components/ui';
import { Field, Section } from '../CanvasBoxFormLayout';
import { CanvasBoxFormValues } from '../canvasBoxSchema';

const StepMeta: React.FC = () => {
  const {
    control,
    register,
  } = useFormContext<CanvasBoxFormValues>();

  const {
    fields: mixinFields,
    append,
    remove,
  } = useFieldArray({
    name: 'mixins',
    control,
  });

  return (
    <Section title="Step 5 - Meta (optional)">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Rules (JSON string)">
          <Controller
            name="rules"
            control={control}
            render={({ field }) => (
              <Input
                textArea
                rows={4}
                placeholder='e.g. { "validate": true }'
                {...field}
              />
            )}
          />
        </Field>
      </div>

      <div className="mt-4">
        <div className="font-medium mb-2">Mixins (optional)</div>
        <div className="space-y-2">
          {mixinFields.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input
                className="flex-1"
                {...register(`mixins.${idx}` as const)}
                placeholder="Mixin entity id"
              />
              <Button
                type="button"
                variant="default"
                onClick={() => remove(idx)}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => append('' as any)}
          >
            Add mixin
          </Button>
        </div>
      </div>
    </Section>
  );
};
export default StepMeta;
