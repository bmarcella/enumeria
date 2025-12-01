/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from "@/configs/endpoint.config";
import { ApiGet, ApiPost } from "./ApiRequest";
import { Project } from "../../../../common/Entity/project";
import { CurrentSetting } from "../../../../common/Entity/UserDto";

export const saveProject = (id_org: string, id_user: string, data: any ): Promise<any> => {
  const url = `${endpointConfig.projects}/${id_org}/organization/${id_user}/user`;
   return ApiPost<Project>(url, data ) 
}

export const changeSettingApi = (data: CurrentSetting): Promise<any> => {
   const url = `${endpointConfig.users}/currentSetting`;
   return ApiPost(url, data) 
}