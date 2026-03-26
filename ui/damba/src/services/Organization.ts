/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from "@/configs/endpoint.config";

import ApiService from "./ApiService";
import { Application, Organization, Project } from "../../../../common/Damba/v2/Entity/project";

export const fetchOrganizations = (id: string): Promise<Organization[]> => {
   return ApiService.fetchDataWithAxios({
      url: `${endpointConfig.organizations}/${id}/user`,
      method: 'get',
   })
}

export const fetchMyProjects = (idUser: string): Promise<Project[]> => {
   return ApiService.fetchDataWithAxios({
      url: `${endpointConfig.projects}/${idUser}/user`,
      method: 'get',
   })
}

export const fetchMyOrgProjects = (idOrg: string): Promise<Project[]> => {
   return ApiService.fetchDataWithAxios({
      url: `${endpointConfig.projects}/${idOrg}/organization`,
      method: 'get',
   })
}

export const fetchApplicationsByProjectId = (id: string ): Promise<Application[]> => {
   return ApiService.fetchDataWithAxios({
      url: `${endpointConfig.projects}/${id}/applications`,
      method: 'get',
   })
}




