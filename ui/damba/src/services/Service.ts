/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from "@/configs/endpoint.config";
import { ApiGet } from "./ApiRequest";

export const fetchEntitiesByServiceId = (id: string, env: string): Promise<any> => {
   const url = `${endpointConfig.services}/${id}/entity/${env}/env`;
   return ApiGet(url) 
}