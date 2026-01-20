/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from '@/configs/endpoint.config'
import { ApiGet, ApiPost } from './ApiRequest'

export const fetchServicesByModuleId = (id_module: string): Promise<any> => {
    const url = `${endpointConfig.modules}/${id_module}/service`
    return ApiGet(url)
}

export const saveModule = (data: any): Promise<any> => {
    const url = `${endpointConfig.modules}`
    return ApiPost(url, data)
}
