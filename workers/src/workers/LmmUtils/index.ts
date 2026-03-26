/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { systemPromptForProject } from './ProjectsPromt';
import {
  systemPromptForApplications,
  systemPromptForModules,
  systemPromptForServices,
  systemPromptForBehaviors,
  systemPromptForMiddlewares,
  systemPromptForPolicies,
  systemPromptForEntities,
  systemPromptForExtras,
  systemPromptForValidators,
  systemPromptForAppFiles,
} from './HierarchyPrompts';

import { z } from 'zod';
import { parseProjectMetadataRunnable } from './ProjectRLambda';
import {
  parseApplicationsRunnable,
  parseModulesRunnable,
  parseServicesRunnable,
  parseBehaviorsRunnable,
  parseMiddlewaresRunnable,
  parsePoliciesRunnable,
  parseEntitiesRunnable,
  parseExtrasRunnable,
  parseValidatorsRunnable,
  parseAppFilesRunnable,
} from './HierarchyRLambdas';
import { callLLM } from './util';
import type {
  ApplicationsResponse,
  ModulesResponse,
  ServicesResponse,
  BehaviorsResponse,
  MiddlewaresResponse,
  PoliciesResponse,
  EntitiesResponse,
  ExtrasResponse,
  ValidatorsResponse,
  AppFilesResponse,
} from './HierarchySchemas';

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

/**
 * Generic internal helper for calling LLM with Damba-specific runnables
 */
const callDambaLLM = async <T, I extends Record<string, any>>(
  llm: any,
  systemPrompt: string,
  userPromptTemplate: string,
  input: I,
  runnable: any,
): Promise<T> => {
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['user', userPromptTemplate],
  ]);
  return callLLM<T>(llm, prompt, input, runnable);
};

export const callLLMForProject = async (llm: any, project: any) => {
  return callDambaLLM<ProjectMetadata, { project: any }>(
    llm,
    systemPromptForProject,
    '{project}',
    { project },
    parseProjectMetadataRunnable,
  );
};

export const callLLMForApplications = async (
  llm: any,
  projectName: string,
  projectDescription: string,
  originalPrompt: string,
): Promise<ApplicationsResponse> => {
  return callDambaLLM<ApplicationsResponse, any>(
    llm,
    systemPromptForApplications,
    'Project: {projectName} \nDescription: {projectDescription}\n User prompt: {originalPrompt}',
    { projectName, projectDescription, originalPrompt },
    parseApplicationsRunnable,
  );
};

export const callLLMForModules = async (
  llm: any,
  appName: string,
  appType: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
): Promise<ModulesResponse> => {
  return callDambaLLM<ModulesResponse, any>(
    llm,
    systemPromptForModules,
    'Application: {appName} (type: {appType})\nDescription: {appDescription} \n\nProject Description: {projectDescription}\n\nInitial Prompt: {initialPrompt}',
    { appName, appType, appDescription, projectDescription, initialPrompt },
    parseModulesRunnable,
  );
};

export const callLLMForMiddlewares = async (
  llm: any,
  appName: string,
  appType: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
  environment: string,
): Promise<MiddlewaresResponse> => {
  return callDambaLLM<MiddlewaresResponse, any>(
    llm,
    systemPromptForMiddlewares,
    'Application: {appName} (type: {appType})\nDescription: {appDescription} \n\nProject Description: {projectDescription}\n\nInitial Prompt: {initialPrompt}\nEnvironment: {environment}',
    { appName, appType, appDescription, projectDescription, initialPrompt, environment },
    parseMiddlewaresRunnable,
  );
};

export const callLLMForPolicies = async (
  llm: any,
  appName: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
  availableMiddlewares: string[],
): Promise<PoliciesResponse> => {
  return callDambaLLM<PoliciesResponse, any>(
    llm,
    systemPromptForPolicies,
    'Application: {appName}\nDescription: {appDescription}\n\nProject Description: {projectDescription}\nInitial Prompt: {initialPrompt}\n\nAvailable Middlewares: {availableMiddlewares}',
    {
      appName,
      appDescription,
      projectDescription,
      initialPrompt,
      availableMiddlewares: availableMiddlewares.join(', '),
    },
    parsePoliciesRunnable,
  );
};

export const callLLMForValidators = async (
  llm: any,
  appName: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
  environment: string,
  entityNames: string[],
): Promise<ValidatorsResponse> => {
  return callDambaLLM<ValidatorsResponse, any>(
    llm,
    systemPromptForValidators,
    'Application: {appName}\nDescription: {appDescription}\n\nProject Description: {projectDescription}\nInitial Prompt: {initialPrompt}\nEnvironment: {environment}\n\nAvailable Entities: {entityNames}',
    { appName, appDescription, projectDescription, initialPrompt, environment, entityNames: entityNames.join(', ') },
    parseValidatorsRunnable,
  );
};

export const callLLMForEntities = async (
  llm: any,
  appName: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
  moduleName: string,
  moduleDescription: string,
  serviceName: string,
  serviceDescription: string,
): Promise<EntitiesResponse> => {
  return callDambaLLM<EntitiesResponse, any>(
    llm,
    systemPromptForEntities,
    'Application: {appName}\nDescription: {appDescription}\n\nProject Description: {projectDescription}\nInitial Prompt: {initialPrompt}\n\nModule: {moduleName}\nDescription: {moduleDescription}\n\nService: {serviceName}\nDescription: {serviceDescription}',
    { appName, appDescription, projectDescription, initialPrompt, moduleName, moduleDescription, serviceName, serviceDescription },
    parseEntitiesRunnable,
  );
};

export const callLLMForServices = async (
  llm: any,
  appName: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
  moduleName: string,
  moduleDescription: string,
  environment: string,
): Promise<ServicesResponse> => {
  return callDambaLLM<ServicesResponse, any>(
    llm,
    systemPromptForServices,
    'Application: {appName}\nDescription: {appDescription}\n\nProject Description: {projectDescription}\nInitial Prompt: {initialPrompt}\n\nModule: {moduleName}\nDescription: {moduleDescription}\nEnvironment: {environment}',
    {
      appName,
      appDescription,
      projectDescription,
      initialPrompt,
      moduleName,
      moduleDescription,
      environment,
    },
    parseServicesRunnable,
  );
};

export const callLLMForExtras = async (
  llm: any,
  appName: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
  moduleName: string,
  moduleDescription: string,
  serviceName: string,
  serviceDescription: string,
): Promise<ExtrasResponse> => {
  return callDambaLLM<ExtrasResponse, any>(
    llm,
    systemPromptForExtras,
    'Application: {appName}\nDescription: {appDescription}\n\nProject Description: {projectDescription}\nInitial Prompt: {initialPrompt}\n\nModule: {moduleName}\nDescription: {moduleDescription}\n\nService: {serviceName}\nDescription: {serviceDescription}',
    {
      appName,
      appDescription,
      projectDescription,
      initialPrompt,
      moduleName,
      moduleDescription,
      serviceName,
      serviceDescription,
    },
    parseExtrasRunnable,
  );
};

export const callLLMForBehaviors = async (
  llm: any,
  appName: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
  moduleName: string,
  moduleDescription: string,
  serviceName: string,
  serviceDescription: string,
  crudConfig: Record<string, boolean>,
  environment: string,
): Promise<BehaviorsResponse> => {
  return callDambaLLM<BehaviorsResponse, any>(
    llm,
    systemPromptForBehaviors,
    'Application: {appName}\nDescription: {appDescription}\n\nProject Description: {projectDescription}\nInitial Prompt: {initialPrompt}\n\nModule: {moduleName}\nDescription: {moduleDescription}\n\nService: {serviceName}\nDescription: {serviceDescription}\nCRUD: {crudConfig}\nEnvironment: {environment}',
    {
      appName,
      appDescription,
      projectDescription,
      initialPrompt,
      moduleName,
      moduleDescription,
      serviceName,
      serviceDescription,
      crudConfig: JSON.stringify(crudConfig),
      environment,
    },
    parseBehaviorsRunnable,
  );
};

export const callLLMForAppFiles = async (
  llm: any,
  appName: string,
  appType: string,
  appDescription: string,
  projectDescription: string,
  initialPrompt: string,
  environment: string,
  moduleNames: string[],
): Promise<AppFilesResponse> => {
  return callDambaLLM<AppFilesResponse, any>(
    llm,
    systemPromptForAppFiles,
    'Application: {appName} (type: {appType})\nDescription: {appDescription}\n\nProject Description: {projectDescription}\nInitial Prompt: {initialPrompt}\nEnvironment: {environment}\nModules: {moduleNames}',
    {
      appName,
      appType,
      appDescription,
      projectDescription,
      initialPrompt,
      environment,
      moduleNames: moduleNames.join(','),
    },
    parseAppFilesRunnable,
  );
};
