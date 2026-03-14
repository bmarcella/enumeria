/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { HiOutlineCube, HiOutlineCheckCircle, HiTrash } from "react-icons/hi";

import { useProjectStore, selectProjects } from "@/stores/useProjectStore";
import Input from "@/components/ui/Input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage";
import Alert from "@/components/ui/Alert";
import Form from "@/components/ui/Form/Form";
import FormItem from "@/components/ui/Form/FormItem";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSocket } from "@/providers/SocketProvider";
import {
  SocketAction,
  EntityType,
  ServiceName,
} from "../../../../../../common/Damba/core/Socket";
import { useSessionUser } from "@/stores/authStore";
import { useNavigate } from "react-router";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import CardQueue from "./CardQueue";
import { JobAckPayload } from "@/services/socket.io/JobAckPlayload";
import { CurrentSetting } from "../../../../../../common/Damba/v2/Entity/UserDto";

type LoadingMap = Record<string, boolean>;

export const projectSchema = z.object({
  description: z.string(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

const message_prompt =
  "Create a todo list app that allow user to manage his tasks. The app should have the following features:\n- Add a task with title and description\n- Edit a task\n- Delete a task\n- Mark a task as completed\n- View all tasks in a list";

export const ProjectList = () => {
  const projects = useProjectStore(selectProjects);
  const model = useMemo(() => "Projects", []);
  const [loading, setLoading] = useState<LoadingMap>({});
  const [message, setMessage] = useTimeOutMessage();
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  // NEW provider API
  const { socket, isConnected, sendAsync } = useSocket();

  const [msgs, setMsgs] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string | undefined>(undefined);

  const setUser = useSessionUser((state) => state.setUser);
  const setProject = useProjectStore((s) => s.setProject);
  const user = useSessionUser((state) => state.user);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<JobAckPayload[]>([]);
  const [counter, setCounter] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      description: message_prompt,
    },
  });

  const changeProject = (id_project?: string) => {
    if (user) {
      setUser({
        ...user,
        currentSetting: {
          ...user.currentSetting,
          projId: id_project ?? "",
          moduleId: "",
          servId: "",
          env: "",
        } as CurrentSetting,
      });
    }
    setProject(id_project ?? "");
    navigate(id_project ? "/projects" : "/home");
  };

  const onSubmitProject = async (data: ProjectFormValues) => {
    const promptText = data.description;

    if (!isConnected) {
      setMessage("Socket not connected. Please try again.");
      return;
    }

    const message_name = `${SocketAction.create(
      EntityType.PROJECT,
      ServiceName.SOCKET
    )}`;

    try {
      setSaving(true);
      setPrompt(promptText);

      const resp = await sendAsync(
        message_name,
        { prompt: promptText },
        { timeoutMs: 30000 } // jobs can take time to enqueue
      );

      console.log("Received ACK:", resp);

      if (!resp?.ok) {
        setMessage(resp?.error ?? "Request failed");
        return;
      }

      // Your server ack shape: resp.data.jobId, resp.correlationId, resp.requestId, resp.tenant_id, resp.event
      const jobId = resp?.data?.jobId;
      if (jobId) {
        setJobs((prev) => [
          ...prev,
          {
            id: jobId,
            prompt: promptText,
            correlationId: resp.correlationId,
            requestId: resp.requestId, // ✅ keep this if your JobAckPayload supports it
            tenant_id: resp.tenant_id,
            status: "queued",
            event: resp.event,
          } as any,
        ]);
      } else {
        // If backend doesn't return jobId, still track the request
        setJobs((prev) => [
          ...prev,
          {
            id: resp.requestId ?? resp.correlationId ?? `req-${Date.now()}`,
            prompt: promptText,
            correlationId: resp.correlationId,
            requestId: resp.requestId,
            tenant_id: resp.tenant_id,
            status: "queued",
            event: resp.event,
          } as any,
        ]);
      }

      setCounter((c) => c + 1);
      setValue(
        "description",
        ` (submitted ${counter + 1} times)\n` + message_prompt
      );
    } catch (error: any) {
      console.error("Error submitting project:", error);
      setMessage(error?.message ?? "Error submitting project");
      setPrompt(undefined);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handler = (m: string) => setMsgs((p) => [...p, m]);
    socket.on("message", handler);
    return () => {
      socket.off("message", handler);
    };
  }, [socket]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
      <aside className="lg:col-span-4">
        <Card
          header={{
            content: "Available Projects",
            bordered: true,
          }}
        >
          {projects.map((project) => {
            const id = String(project.id);
            const isLoading = !!loading[id];

            return (
              <Card key={id} className="mb-2 p-3">
                <div className="flex w-full items-center justify-between gap-3">
                  {/* Left: icon + texts */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700">
                      <HiOutlineCube className="text-xl" />
                    </div>

                    <div className="min-w-0">
                      <h6
                        className={classNames(
                          "m-0 truncate font-semibold hover:text-primary"
                        )}
                      >
                        {project.name}
                      </h6>
                      <p className="m-0 truncate text-xs text-gray-500 dark:text-gray-400">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="default"
                      aria-label="Set active project"
                      title="Set active project"
                      disabled={isLoading}
                      onClick={async () => {
                        changeProject(project.id);
                      }}
                    >
                      <HiOutlineCheckCircle />
                    </Button>

                    <Button
                      variant="solid"
                      aria-label={`Delete ${model}`}
                      title={`Delete ${model}`}
                      disabled={isLoading || !isConnected}
                      onClick={async () => {
                        try {
                          setLoading((prev) => ({
                            ...prev,
                            [id]: true,
                          }));
                          // delete project
                        } finally {
                          setLoading((prev) => ({
                            ...prev,
                            [id]: false,
                          }));
                        }
                      }}
                    >
                      <HiTrash />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </Card>
      </aside>

      <main className="lg:col-span-8">
        <Card
          className="p-4"
          header={{
            content: "Create Project",
            bordered: true,
          }}
        >
          {message && (
            <Alert showIcon className="mb-4" type="danger">
              <span className="break-all">{message}</span>
            </Alert>
          )}

          <div className="space-y-3">
            <Form onSubmit={handleSubmit(onSubmitProject)} className="space-y-4 p-2">
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
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)} // ✅ keep string for z.string()
                    />
                  )}
                />
              </FormItem>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" variant="solid" loading={saving}>
                  {saving
                    ? t("project.saving") ?? "Saving..."
                    : t("project.save") ?? "Save Project"}
                </Button>
              </div>
            </Form>
          </div>
        </Card>
         <Card className="p-4">
           <Button variant="solid" onClick={()=>{
             navigate('/developer/create-agent')
           }}> Developper mode</Button>
        </Card>

        <Card className="p-4">
          <CardQueue data={jobs} />
        </Card>
      </main>
    </div>
  );
};