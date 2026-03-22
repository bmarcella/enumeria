/* eslint-disable @typescript-eslint/no-explicit-any */
import endpointConfig from "@/configs/endpoint.config"
import { ApiGet, ApiPost, ApiPatch, ApiDelete } from "../ApiRequest";

export const listToolArtifacts = (params?: { q?: string; limit?: number; offset?: number }) => {
  // if your backend supports query params, add them here.
  const url = `${endpointConfig.toolArtifacts}`
  return ApiGet(url) // keep simple; you can extend to include params
}

export const getToolArtifact = (id: string) => {
  const url = `${endpointConfig.toolArtifacts}/${id}`
  return ApiGet(url)
}

export const createToolArtifact = (data: any) => {
  const url = `${endpointConfig.toolArtifacts}`
  return ApiPost(url, data)
}

export const updateToolArtifact = (id: string, data: any) => {
  const url = `${endpointConfig.toolArtifacts}/${id}`
  return ApiPatch(url, data)
}

export const deleteToolArtifact = (id: string) => {
  const url = `${endpointConfig.toolArtifacts}/${id}`
  return ApiDelete(url)
}