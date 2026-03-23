/* eslint-disable @typescript-eslint/no-explicit-any */
import endpointConfig from '@/configs/endpoint.config'
import { ApiGet, ApiPost, ApiPut, ApiDelete } from './ApiRequest'

export const grantProjectAccess = (data: any): Promise<any> => {
    return ApiPost(endpointConfig.projectAccess, data)
}

export const fetchProjectAccess = (projectId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.projectAccess}?projectId=${projectId}`)
}

export const updateProjectAccess = (accessId: string, data: any): Promise<any> => {
    return ApiPut(`${endpointConfig.projectAccess}/${accessId}`, data)
}

export const revokeProjectAccess = (accessId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.projectAccess}/${accessId}`)
}

export const addModuleOverride = (accessId: string, data: any): Promise<any> => {
    return ApiPost(`${endpointConfig.projectAccess}/${accessId}/overrides`, data)
}

export const removeModuleOverride = (accessId: string, overrideId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.projectAccess}/${accessId}/overrides/${overrideId}`)
}

export const checkProjectAccess = (userId: string, projectId: string, moduleType?: string): Promise<any> => {
    return ApiPost(`${endpointConfig.projectAccess}/check`, { userId, projectId, moduleType })
}
