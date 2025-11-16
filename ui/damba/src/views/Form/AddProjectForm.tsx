/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Form, FormItem } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { saveProject } from "@/services/Project";
import { useSessionUser } from "@/stores/authStore";
import { useOrganizationId } from "@/utils/hooks/useOrganization";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import useTranslation from "@/utils/hooks/useTranslation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { DambaEnvironments, DambaEnvironmentType } from "../../../../../common/Entity/env";

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  envs: z.array(z.string()).min(1, 'Environment is required'),
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
    const [message, setMessage] = useTimeOutMessage()
    const { t } = useTranslation();
    const [envOptions, setEnvOptions] = useState<Array<{ label: string; value: string }>>([]);
    const { control, handleSubmit, formState: { errors },  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      envs: [DambaEnvironmentType.PROD],
      description: '',
      ...defaultValues,
    },
  });

   useEffect(() => {
        const load = async () => {
          setEnvOptions(DambaEnvironments(t) as any)
        };
        load();
    }, []);

  const onSubmitProject =(data: ProjectFormValues) => {
      const env = data.envs.find((env)=> env == DambaEnvironmentType.PROD);
      if (!env)  { setMessage(t('project.error.mustSelectProg')); 
        return; 
      }
      setSaving(true);
      saveProject(orgId, user.id!, data).then((res)=>{
          console.log(res)
          setSaving(false);
          onSubmit({ error: false, project: res })
      }).catch((error)=>{
          console.log(error)
          setMessage(error?.message)
          setSaving(false);
          onSubmit({ error: true })
      });
   }
    return (
        <>
          {message && (
                <Alert showIcon className="mb-4" type="danger">
                    <span className="break-all">{message}</span>
                </Alert>
            )}
<Form onSubmit={handleSubmit(onSubmitProject)} className="space-y-4 p-2">
      {/* Name */}
      <FormItem label="Project Name" invalid={!!errors.name} errorMessage={errors.name?.message}>
        <Controller name="name" control={control}
         render={({ field }) => <Input {...field} />}
          />
      </FormItem>

           {/* RequestType */}
                    <FormItem
                        label={'Please select the enviroments'}
                        invalid={!!errors.envs}
                        errorMessage={errors.envs?.message}
                    >
                        <Controller
                            name="envs"
                            control={control}
                            
                            render={({ field }) => (
                                <Select
                                    isMulti
                                    placeholder={t('common.select')}
                                    options={envOptions}
                                    value={ envOptions.filter(opt => field.value?.includes(opt.value))}
                                    onChange={(opts: any[]) => field.onChange(opts.map(o => o.value))}
                                />
                            )}

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
