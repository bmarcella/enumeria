import { Http } from "@Damba/v1/service/IServiceDamba";

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
  env?: string;

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
  env?: string;

  createdAt?: string;
  updatedAt?: string;
}
