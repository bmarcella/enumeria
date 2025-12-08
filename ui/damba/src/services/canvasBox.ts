/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from "@/configs/endpoint.config";
import { ApiPost } from "./ApiRequest";
import { Project } from "../../../../common/Entity/project";
import { CanvasBox } from "../../../../common/Entity/CanvasBox";

export const addEntityApi = ( data: any ): Promise<any> => {
   const url = `${endpointConfig.entities}`;
   return ApiPost<CanvasBox>(url, data) 
}

export const updateEntityApi = ( id: string, data: any ): Promise<any> => {
   const url = `${endpointConfig.entities}/${id}`;
   return ApiPost<CanvasBox>(url, data) 
}
