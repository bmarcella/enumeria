/* eslint-disable @typescript-eslint/no-explicit-any */

import { Input, Select } from '@/components/ui';
import { CanvasBoxClassification, EntityStereotype } from '../../../../../../../common/Entity/CanvasBox';
import { useFormContext, Controller } from 'react-hook-form';
import { Section, Field } from '../CanvasBoxFormLayout';
import { CanvasBoxFormValues } from '../canvasBoxSchema';
import { useEntityStore } from '@/stores/useEntityStore';
import { useMemo } from 'react';

const classificationOptions = Object.values(CanvasBoxClassification).map(v => ({
  value: v,
  label: v,
}));

const stereotypeOptions = Object.values(EntityStereotype).map(v => ({
  value: v,
  label: v,
}));

const StepGeneral: React.FC = () => {
  const entities = useEntityStore((s) => s.entities);

  const entitiesOptions = useMemo(()=> {
      return  entities.map((e)=>{
            return {
               value: e.id,
               label: e.entityName,
            }
      });
  },[entities])

  const {
    control,
    formState: { errors },
  } = useFormContext<CanvasBoxFormValues>();

  return (
    <Section title="General (required)">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* entityName */}
        <Field
          label="Entity name"
          errors={{ key: 'entityName', data: errors }}
        >
          <Controller
            name="entityName"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Field>

        {/* stereotype */}
        <Field label="Stereotype">
          <Controller
            name="stereotype"
            control={control}
            render={({ field }) => {
              const value =
                stereotypeOptions.find((o) => o.value === field.value) ||
                null;
              return (
                <Select
                  options={stereotypeOptions}
                  value={value}
                  onChange={(option: any) => field.onChange(option?.value)}
                />
              );
            }}
          />
        </Field>

        {/* extendsId */}
        <Field label="Extends (parent entity id)">
          <Controller
            name="extendsId"
            control={control}
            render={({ field }) =>  <Select
                  options={[{ value: undefined,
               label: 'none',}].concat(entitiesOptions as any)}
                  onChange={(option: any) => field.onChange(option?.value)}
                /> }
          />
        </Field>

        {/* NEW: classification */}
        <Field label="Classification">
          <Controller
            name="classification"
            control={control}
            render={({ field }) => {
              const value =
                classificationOptions.find((o) => o.value === field.value) ||
                null;
              return (
                <Select
                  options={classificationOptions}
                  value={value}
                  onChange={(option: any) => field.onChange(option?.value)}
                />
              );
            }}
          />
        </Field>

      
      </div>
       <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
       {/* description */}
        <Field label="Description">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input textArea rows={3} {...field} />
            )}
          />
        </Field>
       </div>
    </Section>
  );
};

export default StepGeneral;
