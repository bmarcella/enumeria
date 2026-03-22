/* eslint-disable @typescript-eslint/no-explicit-any */
import endpointConfig from '@/configs/endpoint.config'
import { ApiDelete, ApiGet, ApiPost, ApiPut } from '../ApiRequest'

export const fetchRunnableLambdas = (): Promise<any> => {
    const url = `${endpointConfig.runnableLambdas}`
    return ApiGet(url)
}

export const fetchRunnableLambdaById = (id: string): Promise<any> => {
    const url = `${endpointConfig.runnableLambdas}/${id}`
    return ApiGet(url)
}

export const createRunnableLambda = (data: any): Promise<any> => {
    const url = `${endpointConfig.runnableLambdas}`
    return ApiPost(url, data)
}

export const updateRunnableLambda = (id: string, data: any): Promise<any> => {
    const url = `${endpointConfig.runnableLambdas}/${id}`
    return ApiPut(url, data)
}

export const deleteRunnableLambda = (id: string): Promise<any> => {
    const url = `${endpointConfig.runnableLambdas}/${id}`
    return ApiDelete(url)
}