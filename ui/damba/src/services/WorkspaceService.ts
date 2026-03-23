/* eslint-disable @typescript-eslint/no-explicit-any */
import endpointConfig from '@/configs/endpoint.config'
import { ApiGet, ApiPost } from './ApiRequest'

export const fetchCurrentWorkspace = (): Promise<any> => {
    return ApiGet(`${endpointConfig.workspace}/current`)
}

export const switchWorkspace = (orgId: string | null): Promise<any> => {
    return ApiPost(`${endpointConfig.workspace}/switch`, { orgId })
}

export const fetchPersonalProjects = (): Promise<any> => {
    return ApiGet(`${endpointConfig.workspace}/personal/projects`)
}

export const fetchOrgProjects = (orgId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.workspace}/org/${orgId}/projects`)
}

export const fetchOrgMembers = (orgId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.workspace}/org/${orgId}/members`)
}
