// LmmUtils/HierarchyRLambdas.ts
import { RunnableLambda } from '@langchain/core/runnables';
import { extractText, safeJsonParse } from './util';
import {
  ApplicationsResponse,
  ApplicationsResponseSchema,
  ModulesResponse,
  ModulesResponseSchema,
  ServicesResponse,
  ServicesResponseSchema,
  BehaviorsResponse,
  BehaviorsResponseSchema,
  MiddlewaresResponse,
  MiddlewaresResponseSchema,
  PoliciesResponse,
  PoliciesResponseSchema,
  EntitiesResponse,
  EntitiesResponseSchema,
  ExtrasResponse,
  ExtrasResponseSchema,
  ValidatorsResponse,
  ValidatorsResponseSchema,
  AppFilesResponse,
  AppFilesResponseSchema,
} from './HierarchySchemas';

export const parseApplicationsRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<ApplicationsResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return ApplicationsResponseSchema.parse(json);
  },
});

export const parseModulesRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<ModulesResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return ModulesResponseSchema.parse(json);
  },
});

export const parseServicesRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<ServicesResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return ServicesResponseSchema.parse(json);
  },
});

export const parseBehaviorsRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<BehaviorsResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return BehaviorsResponseSchema.parse(json);
  },
});

export const parseMiddlewaresRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<MiddlewaresResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return MiddlewaresResponseSchema.parse(json);
  },
});

export const parsePoliciesRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<PoliciesResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return PoliciesResponseSchema.parse(json);
  },
});

export const parseEntitiesRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<EntitiesResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return EntitiesResponseSchema.parse(json);
  },
});

export const parseExtrasRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<ExtrasResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return ExtrasResponseSchema.parse(json);
  },
});

export const parseValidatorsRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<ValidatorsResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return ValidatorsResponseSchema.parse(json);
  },
});

export const parseAppFilesRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<AppFilesResponse> => {
    const text = extractText(input);
    const json = safeJsonParse(text);
    return AppFilesResponseSchema.parse(json);
  },
});
