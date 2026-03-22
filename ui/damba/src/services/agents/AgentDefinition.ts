/* eslint-disable @typescript-eslint/no-explicit-any */
import endpointConfig from "@/configs/endpoint.config";
import { ApiPost, ApiPatch, ApiGet } from "../ApiRequest";

export const createAgentDefinition = (data: any): Promise<any> => {
  const url = `${endpointConfig.agentDefinitions}`;
  return ApiPost(url, data);
};

export const getAgentDefinitions = (): Promise<any> => {
  const url = `${endpointConfig.agentDefinitions}`;
  return ApiGet(url);
};



export const updateAgentDefinition = (agentDefinitionId: string, data: any): Promise<any> => {
  const url = `${endpointConfig.agentDefinitions}/${agentDefinitionId}`;
  return ApiPatch(url, data);
};

export const submitAgentDefinition = (agentDefinitionId: string): Promise<any> => {
  const url = `${endpointConfig.agentDefinitions}/${agentDefinitionId}/submit`;
  return ApiPost(url, {});
};

export const getAgentDefinition = (agentDefinitionId: string): Promise<any> => {
  const url = `${endpointConfig.agentDefinitions}/${agentDefinitionId}`;
  return ApiGet(url);
};

// (plus tard)
export const delistAgentDefinition = (agentDefinitionId: string): Promise<any> => {
  const url = `${endpointConfig.agentDefinitions}/${agentDefinitionId}/delist`;
  return ApiPost(url, {});
};

export const approveAgentDefinition = (agentDefinitionId: string): Promise<any> => {
  const url = `${endpointConfig.agentDefinitions}/${agentDefinitionId}/approve`;
  return ApiPost(url, {});
};

export const rejectAgentDefinition = (agentDefinitionId: string): Promise<any> => {
  const url = `${endpointConfig.agentDefinitions}/${agentDefinitionId}/reject`;
  return ApiPost(url, {});
};

export const updateAgentManifest = (agentDefinitionId: string, agentManifest: any) => {
  const url = `${endpointConfig.agentDefinitions}/${agentDefinitionId}/updateManifest`
  return ApiPatch(url, { agentManifest })
}