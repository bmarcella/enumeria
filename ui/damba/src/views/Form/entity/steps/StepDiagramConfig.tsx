// canvas-box/steps/StepDiagramConfig.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input, Checkbox, Select } from '@/components/ui';
import { Field, Section } from '../CanvasBoxFormLayout';
import { CanvasBoxFormValues } from '../canvasBoxSchema';
import { VisibilityTypeClass } from '../../../../../../../common/Entity/CanvasBox';
import IconPicker from '@/views/components/IconPicker';
const visibilityClassOptions = Object.values(VisibilityTypeClass).map((v) => ({
  value: v,
  label: v,
}));

const StepDiagramConfig: React.FC = () => {
  const { control } = useFormContext<CanvasBoxFormValues>();

  return (
    <Section title="Diagram / Visual (optional)">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {/* Visibility */}
        <Field label="Visibility">
          <Controller
            name="diagramConfig.visibility"
            control={control}
            render={({ field }) => {
              const value =
                visibilityClassOptions.find((o) => o.value === field.value) ||
                null;
              return (
                <Select
                  options={visibilityClassOptions}
                  value={value}
                  onChange={(option: any) => field.onChange(option?.value)}
                />
              );
            }}
          />
        </Field>

        {/* Color: your color picker from earlier */}
        <Field label="Color">
          <Controller
            name="diagramConfig.color"
            control={control}
            render={({ field }) => {
              const colorValue = field.value || '#4F46E5';
              return (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorValue}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-9 w-12 rounded-md border border-gray-200 cursor-pointer p-0"
                  />
                  <Input
                    {...field}
                    value={colorValue}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="#4F46E5"
                  />
                </div>
              );
            }}
          />
        </Field>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    
    
        {/* Abstract */}
        <Field label="Abstract class">
          <Controller
            name="diagramConfig.isAbstract"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox checked={!!field.value} onChange={field.onChange} />
                <span className="text-xs text-muted-foreground">Abstract</span>
              </div>
            )}
          />
        </Field>

        {/* Auth entity */}
        <Field label="Auth entity">
          <Controller
            name="diagramConfig.isAuth"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox checked={!!field.value} onChange={field.onChange} />
                <span className="text-xs text-muted-foreground">
                  Used for authentication
                </span>
              </div>
            )}
          />
        </Field>

        {/* Locked */}
        <Field label="Locked">
          <Controller
            name="diagramConfig.locked"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox checked={!!field.value} onChange={field.onChange} />
                <span className="text-xs text-muted-foreground">
                  Prevent editing on canvas
                </span>
              </div>
            )}
          />
        </Field>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
        {/* Icon: now using IconPicker */}
        <Field label="Icon">
          <Controller
            name="diagramConfig.icon"
            control={control}
            render={({ field }) => (
              <IconPicker
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>
       </div>
    </Section>
  );
};

export default StepDiagramConfig;
