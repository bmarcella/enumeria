/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from '@/configs/endpoint.config'
import { ApiGet, ApiPost } from './ApiRequest'

export const fetchEntitiesByServiceId = (
    id: string,
    env: string,
): Promise<any> => {
    const url = `${endpointConfig.services}/${id}/entity/${env}/env`
    return ApiGet(url)
}

export const saveService = (data: any): Promise<any> => {
    const url = `${endpointConfig.services}`
    return ApiPost(url, data)
}
