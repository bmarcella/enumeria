/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { saveProject } from "@/services/Project";
import { useSessionUser } from "@/stores/authStore";
import { useOrganizationId } from "@/utils/hooks/useOrganization";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
})

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>
  onSubmit: (data: any) => void | Promise<void>
  onCancel?: () => void
}

export type ProjectFormValues = z.infer<typeof projectSchema>
const AddProjectForm = ({
  defaultValues,
  onSubmit,
  onCancel
}: ProjectFormProps) => {
    const [saving, setSaving] = useState(false)
    const orgId = useOrganizationId();
    const user = useSessionUser((s) => s.user)
    const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      ...defaultValues,
    },
  });

  const onSubmitProject =(data: ProjectFormValues) => {
      setSaving(true);
      saveProject(orgId, user.id!, data).then((res)=>{
          console.log(res)
          setSaving(false);
          // onSubmit({error: false, data: res})
      }).catch((error)=>{
         console.log(error)
          setSaving(false);
          // onSubmit({error: true, data: error})
      });
   }
    return (
        <>
<Form onSubmit={handleSubmit(onSubmitProject)} className="space-y-4 p-2">
      {/* Name */}
      <FormItem label="Project Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
        <Controller name="name" control={control}
         render={({ field }) => <Input {...field} />}
          />
      </FormItem>

    

    
      {/* Description */}
      <FormItem label="Description" invalid={!!errors.description} errorMessage={errors.description?.message}>
        <Controller
          name="description"
          control={control}
          render={({ field }) => <Input 
          {...field} 
            value={ field.value ?? ''} // never pass null to the input
            onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
           textArea  />}
        />
      </FormItem>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="plain" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="solid" loading={!!saving}>
          {saving ? 'Saving...' : 'Save Project'}
        </Button>
      </div>
    </Form>
        </>
    )
}

export default AddProjectForm;
