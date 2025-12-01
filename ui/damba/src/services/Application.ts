/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from "@/configs/endpoint.config";
import { ApiGet } from "./ApiRequest";



export const fetchModulesByAppId = (id_application: string): Promise<any> => {
  const url = `${endpointConfig.modules}/${id_application}/application`;
   return ApiGet(url);
}