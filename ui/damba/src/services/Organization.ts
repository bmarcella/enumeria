/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from "@/configs/endpoint.config";

import { Application, Organization, Project } from "../../../../common/Entity/project";
import ApiService from "./ApiService";

export const fetchOrganizations = (id: string): Promise<Organization[]> => {

   return ApiService.fetchDataWithAxios({
      url: `${endpointConfig.organizations}/${id}/user`,
      method: 'get',
   })
}


export const fetchProject = (idUser: string, idOrg: string): Promise<Project[]> => {

   return ApiService.fetchDataWithAxios({
      url: `${endpointConfig.projects}/${idOrg}/organization/${idUser}/user`,
      method: 'get',
   })
}

export const fetchApplication = (idProj: string, env: string ): Promise<Application[]> => {
   return ApiService.fetchDataWithAxios({
      url: `${endpointConfig.applications}/${idProj}/project/${env}`,
      method: 'get',
   })
}




