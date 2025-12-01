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
import {
  DambaEnvironments,
  DambaEnvironmentType,
} from "../../../../../../common/Entity/env";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  envs: z.array(z.string()).min(1, "Environment is required"),
  description: z.string().optional().nullable(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  onSubmit: (data: any) => void | Promise<void>;
  onCancel?: () => void;
}

const AddProjectForm = ({
  defaultValues,
  onSubmit,
  onCancel,
}: ProjectFormProps) => {
  const [saving, setSaving] = useState(false);
  const orgId = useOrganizationId();
  const user = useSessionUser((s) => s.user);
  const setUser = useSessionUser((s) => s.setUser);
  const [message, setMessage] = useTimeOutMessage();
  const { t } = useTranslation();
  const [envOptions, setEnvOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      envs: [DambaEnvironmentType.DEV, DambaEnvironmentType.PROD],
      description: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    const load = async () => {
      setEnvOptions(DambaEnvironments(t) as any);
    };
    load();
  }, [t]);

  const onSubmitProject = (data: ProjectFormValues) => {
    const prodEnv = data.envs.find((env) => env === DambaEnvironmentType.PROD);
    const devEnv = data.envs.find((env) => env === DambaEnvironmentType.DEV);

    if (!prodEnv) {
      setMessage(t("error.project.mustSelectProg"));
      return;
    }
    if (!devEnv) {
      setMessage(t("error.project.mustSelectDev"));
      return;
    }

    setSaving(true);
    saveProject(orgId, user.id!, data)
      .then((res: { project: any; setting: any }) => {
        console.log(res);
        setSaving(false);
        user.currentSetting = res.setting;
        setUser(user);
        onSubmit({ error: false, project: res.project, setting: res.setting });
      })
      .catch((error) => {
        console.log(error);
        setMessage(error?.message);
        setSaving(false);
        onSubmit({ error: true });
      });
  };

  return (
    <>
      {message && (
        <Alert showIcon className="mb-4" type="danger">
          <span className="break-all">{message}</span>
        </Alert>
      )}

      <Form onSubmit={handleSubmit(onSubmitProject)} className="space-y-4 p-2">
        {/* Name */}
        <FormItem
          label={t("project.name") ?? "Project Name"}
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </FormItem>

        {/* Environments */}
        <FormItem
          label={t("project.envLabel") ?? "Please select the environments"}
          invalid={!!errors.envs}
          errorMessage={errors.envs?.message as string | undefined}
        >
          <Controller
            name="envs"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                placeholder={t("common.select")}
                options={envOptions}
                value={envOptions.filter((opt) =>
                  field.value?.includes(opt.value)
                )}
                onChange={(opts: any[]) =>
                  field.onChange(opts?.map((o) => o.value) ?? [])
                }
              />
            )}
          />
        </FormItem>

        {/* Description */}
        <FormItem
          label={t("project.description") ?? "Description"}
          invalid={!!errors.description}
          errorMessage={errors.description?.message as string | undefined}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                textArea
                value={field.value ?? ""} // avoid passing null
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : e.target.value
                  )
                }
              />
            )}
          />
        </FormItem>

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button type="button" variant="plain" onClick={onCancel}>
              {t("common.cancel") ?? "Cancel"}
            </Button>
          )}
          <Button type="submit" variant="solid" loading={saving}>
            {saving
              ? t("project.saving") ?? "Saving..."
              : t("project.save") ?? "Save Project"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default AddProjectForm;
