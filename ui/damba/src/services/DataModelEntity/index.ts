/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from '@/configs/endpoint.config'
import { ApiPost } from '../ApiRequest'

export const addEntityApi = (data: any): Promise<any> => {
    const url = `${endpointConfig.dataModelerEntities}`
    return ApiPost<any>(url, data)
}

export const updateEntityApi = (id: string, data: any): Promise<any> => {
    const url = `${endpointConfig.dataModelerEntities}/${id}`
    return ApiPost<any>(url, data)
}
