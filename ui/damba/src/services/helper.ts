import endpointConfig from "@/configs/endpoint.config";
import { ApiGet } from "./ApiRequest";

export const getDambaFiles = (): Promise<any> => {
   const url = `${endpointConfig.helper}/loadDFiles`;
   return ApiGet(url);
}