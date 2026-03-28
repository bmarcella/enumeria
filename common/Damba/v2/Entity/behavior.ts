import { Http } from "../../v2/service/IServiceDamba";
import { DambaEnvironmentType } from "./env";

export type Behavior = {
  id?: string;
  name: string;
  method: Http;
  path: string;
  midlewares?: any[];
  extras?: any[];

  // scope embedded in the entity
  orgId?: string;
  projectId?: string;
  appId?: string;
  moduleId?: string;
  serviceId?: string;
  environment?: DambaEnvironmentType;

  createdAt?: string;
  updatedAt?: string;
};

export interface Middleware {
  id?: string;
  name: string;
  description: string;
  behaviors?: any[];
  policies?: any[];

  orgId?: string;
  projectId?: string;
  appId?: string;
  moduleId?: string;
  serviceId?: string;
  environment?: DambaEnvironmentType;

  createdAt?: string;
  updatedAt?: string;
}
