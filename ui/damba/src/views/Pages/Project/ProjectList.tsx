/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { HiOutlineCube, HiOutlineCheckCircle, HiTrash } from "react-icons/hi";

import { useProjectStore, selectProjects } from "@/stores/useProjectStore";
import { ProjectStats } from "./ProjectStats";
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
    <div className="mt-8 flex flex-col gap-10">
      {/* Section Supérieure : Création de projet */}
      <section className="w-full">
        <Card className="p-0 overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg bg-white dark:bg-[#0B1120]">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-[#1E293B] bg-gray-50 dark:bg-[#0F172A]">
             <h6 className="font-bold text-lg tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
               <HiOutlineCube className="text-blue-600 dark:text-blue-500" />
               New Automation Project
             </h6>
             <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
               Describe the application you want to generate with our AI engine
             </p>
          </div>
          
          <div className="p-6">
            {message && (
              <Alert showIcon className="mb-4" type="danger">
                <span className="break-all text-xs">{message}</span>
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmitProject)} className="space-y-4">
              <FormItem
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
                      rows={8}
                      className="text-sm font-mono leading-relaxed resize-none rounded-md bg-gray-50 dark:bg-[#0f172a] border-gray-300 dark:border-[#1E293B] focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                      placeholder="e.g. Create a todo list app that permits users to..."
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  )}
                />
              </FormItem>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="solid" loading={saving} className="px-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold tracking-wide rounded-md shadow-md shadow-blue-500/20">
                  {saving
                    ? (t("project.saving") ?? "Generating...")
                    : (t("project.save") ?? "Generate with AI")}
                </Button>
              </div>
            </Form>
          </div>
        </Card>

        {jobs.length > 0 && (
          <Card className="p-0 overflow-hidden mt-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F172A]">
              <h6 className="font-semibold text-sm tracking-wide uppercase text-gray-600 dark:text-gray-300">
                Active Jobs
              </h6>
            </div>
            <div className="p-4 bg-white dark:bg-[#0B1120]">
              <CardQueue data={jobs} />
            </div>
          </Card>
        )}
      </section>

      {/* Section Inférieure : Liste des projets */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#1E293B]">
          <div>
             <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
               Projects
             </h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and access your generated applications</p>
          </div>
          <Button 
             variant="default" 
             className="border-gray-300 dark:border-gray-700 font-semibold bg-white dark:bg-[#0F172A] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors" 
             onClick={() => navigate('/developer/create-agent')}
          >
             Advance Developer Mode
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed rounded-lg border-gray-300 dark:border-[#1E293B] bg-gray-50/50 dark:bg-[#0f172a]/50">
            <HiOutlineCube className="text-5xl text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              No projects found. Create one above to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => {
              const id = String(project.id);
              const isLoading = !!loading[id];

              return (
                <Card 
                  key={id} 
                  className="flex flex-col h-full overflow-hidden border border-gray-200 dark:border-[#1E293B] bg-white dark:bg-[#0B1120] hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 rounded-lg"
                >
                  <div className="p-6 flex-grow flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                       <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                         <HiOutlineCube className="text-2xl" />
                       </div>
                       <ProjectStats projectId={id} />
                    </div>
                    <div>
                       <h6 
                         className="m-0 mb-1.5 truncate text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer" 
                         onClick={() => changeProject(project.id)}
                       >
                         {project.name}
                       </h6>
                       <p className="m-0 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-normal">
                         {project.description}
                       </p>
                    </div>
                  </div>

                  <div className="flex items-center border-t border-gray-200 dark:border-[#1E293B] bg-gray-50 dark:bg-[#0F172A] p-3 gap-3">
                    <Button
                      variant="solid"
                      size="sm"
                      className="flex-grow font-semibold tracking-wide bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded shadow-sm"
                      disabled={isLoading}
                      onClick={() => changeProject(project.id)}
                      icon={<HiOutlineCheckCircle className="text-lg" />}
                    >
                      {t("project.open") ?? "Open"}
                    </Button>

                    <Button
                      variant="plain"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 px-3 rounded"
                      disabled={isLoading || !isConnected}
                      onClick={async () => {
                        try {
                          setLoading((prev) => ({ ...prev, [id]: true }));
                          // delete project
                        } finally {
                          setLoading((prev) => ({ ...prev, [id]: false }));
                        }
                      }}
                      icon={<HiTrash className="text-lg" />}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};