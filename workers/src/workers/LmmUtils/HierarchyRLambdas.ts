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
