/* eslint-disable @typescript-eslint/no-explicit-any */
import endpointConfig from '@/configs/endpoint.config'
import { ApiGet, ApiPost, ApiPut, ApiDelete } from './ApiRequest'

// === ACTORS ===

export const fetchActors = (orgId: string, projId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.useCaseActors}?orgId=${orgId}&projId=${projId}`)
}

export const createActor = (data: any): Promise<any> => {
    return ApiPost(endpointConfig.useCaseActors, data)
}

export const updateActor = (actorId: string, data: any): Promise<any> => {
    return ApiPut(`${endpointConfig.useCaseActors}/${actorId}`, data)
}

export const deleteActor = (actorId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.useCaseActors}/${actorId}`)
}

// === USE CASES ===

export const fetchUseCases = (orgId: string, projId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.useCases}?orgId=${orgId}&projId=${projId}`)
}

export const fetchUseCase = (useCaseId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.useCases}/${useCaseId}`)
}

export const createUseCase = (data: any): Promise<any> => {
    return ApiPost(endpointConfig.useCases, data)
}

export const updateUseCase = (useCaseId: string, data: any): Promise<any> => {
    return ApiPut(`${endpointConfig.useCases}/${useCaseId}`, data)
}

export const deleteUseCase = (useCaseId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.useCases}/${useCaseId}`)
}

// === SCENARIOS ===

export const createScenario = (useCaseId: string, data: any): Promise<any> => {
    return ApiPost(`${endpointConfig.useCases}/${useCaseId}/scenarios`, data)
}

export const updateScenario = (useCaseId: string, scenarioId: string, data: any): Promise<any> => {
    return ApiPut(`${endpointConfig.useCases}/${useCaseId}/scenarios/${scenarioId}`, data)
}

export const deleteScenario = (useCaseId: string, scenarioId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.useCases}/${useCaseId}/scenarios/${scenarioId}`)
}

// === RELATIONSHIPS ===

export const fetchUseCaseRelationships = (orgId: string, projId: string): Promise<any> => {
    return ApiGet(`${endpointConfig.useCaseRelationships}?orgId=${orgId}&projId=${projId}`)
}

export const createUseCaseRelationship = (data: any): Promise<any> => {
    return ApiPost(endpointConfig.useCaseRelationships, data)
}

export const deleteUseCaseRelationship = (relationshipId: string): Promise<any> => {
    return ApiDelete(`${endpointConfig.useCaseRelationships}/${relationshipId}`)
}
