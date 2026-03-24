import { ChatPromptTemplate } from "@langchain/core/prompts";
import { systemPromptForProject } from "./ProjectsPromt";
import {
  systemPromptForApplications,
  systemPromptForModules,
  systemPromptForServices,
  systemPromptForBehaviors,
} from "./HierarchyPrompts";
import { z } from "zod";
import { parseProjectMetadataRunnable } from "./ProjectRLambda";
import {
  parseApplicationsRunnable,
  parseModulesRunnable,
  parseServicesRunnable,
  parseBehaviorsRunnable,
} from "./HierarchyRLambdas";
import { callLLM } from "./util";
import type {
  ApplicationsResponse,
  ModulesResponse,
  ServicesResponse,
  BehaviorsResponse,
} from "./HierarchySchemas";

export const ProjectMetadataSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must have at least 2 characters')
    .max(80, 'Project name is too long'),
  description: z
    .string()
    .min(10, 'Description must have at least 10 characters')
    .max(500, 'Description is too long'),
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;

export const callLLMForProject = async (llm: any, project: any) => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptForProject],
    ["user", "{project}"],
  ]);
  return callLLM<ProjectMetadata>(llm, prompt, { project }, parseProjectMetadataRunnable);
};

export const callLLMForApplications = async (
  llm: any,
  projectName: string,
  projectDescription: string,
  originalPrompt: string
): Promise<ApplicationsResponse> => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptForApplications],
    ["user", "Project: {projectName} \nDescription: {projectDescription}\n User prompt: {originalPrompt}"],
  ]);
  return callLLM<ApplicationsResponse>(llm, prompt, { projectName, projectDescription, originalPrompt }, parseApplicationsRunnable);
};

export const callLLMForModules = async (
  llm: any,
  appName: string,
  appType: string,
  appDescription: string,
  environment: string
): Promise<ModulesResponse> => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptForModules],
    ["user", "Application: {appName} (type: {appType})\nDescription: {appDescription}\nEnvironment: {environment}"],
  ]);
  return callLLM<ModulesResponse>(llm, prompt, { appName, appType, appDescription, environment }, parseModulesRunnable);
};

export const callLLMForServices = async (
  llm: any,
  moduleName: string,
  moduleDescription: string,
  environment: string
): Promise<ServicesResponse> => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptForServices],
    ["user", "Module: {moduleName}\nDescription: {moduleDescription}\nEnvironment: {environment}"],
  ]);
  return callLLM<ServicesResponse>(llm, prompt, { moduleName, moduleDescription, environment }, parseServicesRunnable);
};

export const callLLMForBehaviors = async (
  llm: any,
  serviceName: string,
  serviceDescription: string,
  crudConfig: Record<string, boolean>,
  environment: string
): Promise<BehaviorsResponse> => {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptForBehaviors],
    ["user", "Service: {serviceName}\nDescription: {serviceDescription}\nCRUD: {crudConfig}\nEnvironment: {environment}"],
  ]);
  return callLLM<BehaviorsResponse>(llm, prompt, {
    serviceName,
    serviceDescription,
    crudConfig: JSON.stringify(crudConfig),
    environment,
  }, parseBehaviorsRunnable);
};