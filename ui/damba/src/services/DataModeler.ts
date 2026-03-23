/* eslint-disable @typescript-eslint/no-explicit-any */
import endpointConfig from '@/configs/endpoint.config'
import { ApiGet, ApiPost, ApiPut, ApiDelete } from './ApiRequest'

// === ENTITIES ===

export const fetchDataModelEntities = (orgId: string, projId: string, servId?: string): Promise<any> => {
    let url = `${endpointConfig.dataModelerEntities}?orgId=${orgId}&projId=${projId}`
    if (servId) url += `&servId=${servId}`
    return ApiGet(url)
}

export const fetchDataModelEntity = (entityId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.dataModelerEntities}/${entityId}`)
}

export const createDataModelEntity = (data: any): Promise<any> => {
    return ApiPost(endpointConfig.dataModelerEntities, data)
}

export const updateDataModelEntity = (entityId: string, data: any): Promise<any> => {
    return ApiPut(`${endpointConfig.dataModelerEntities}/${entityId}`, data)
}

export const deleteDataModelEntity = (entityId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.dataModelerEntities}/${entityId}`)
}

// === COLUMNS ===

export const fetchColumns = (entityId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.dataModelerEntities}/${entityId}/columns`)
}

export const createColumn = (entityId: string, data: any): Promise<any> => {
    return ApiPost(`${endpointConfig.dataModelerEntities}/${entityId}/columns`, data)
}

export const updateColumn = (entityId: string, columnId: string, data: any): Promise<any> => {
    return ApiPut(`${endpointConfig.dataModelerEntities}/${entityId}/columns/${columnId}`, data)
}

export const deleteColumn = (entityId: string, columnId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.dataModelerEntities}/${entityId}/columns/${columnId}`)
}

// === RELATIONSHIPS ===

export const fetchRelationships = (orgId: string, projId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.dataModelerRelationships}?orgId=${orgId}&projId=${projId}`)
}

export const createRelationship = (data: any): Promise<any> => {
    return ApiPost(endpointConfig.dataModelerRelationships, data)
}

export const deleteRelationship = (relationshipId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.dataModelerRelationships}/${relationshipId}`)
}
