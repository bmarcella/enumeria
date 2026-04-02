/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from '@/configs/endpoint.config'
import { ApiPost, ApiDelete, ApiPatch } from './ApiRequest'
import { CurrentSetting } from '../../../../common/Damba/v2/Entity/UserDto'
import { Project } from '../../../../common/Damba/v2/Entity/project'

export const saveProject = (
    id_org: string,
    id_user: string,
    data: any,
): Promise<any> => {
    const url = `${endpointConfig.projects}/${id_org}/organization/${id_user}/user`
    return ApiPost<Project>(url, data)
}

export const deleteProject = (projectId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.projects}/${projectId}`)
}

export const changeSettingApi = (data: CurrentSetting): Promise<any> => {
    const url = `${endpointConfig.auth}/meta`
    return ApiPost(url, data)
}

export const updateProjectStep = (
    projectId: string,
    data: { step: string; buildStatus?: string },
): Promise<any> => {
    const url = `${endpointConfig.projects}/${projectId}`
    return ApiPatch(url, data)
}
