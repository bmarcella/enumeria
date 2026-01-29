/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEvent } from "./DEvent";

export type LoaderParams = {
   method: string,
   action: string,
   index?: number, 
}
export type CrudActions = <T> (e: DEvent, prev?: T, before?: Partial<T> | T | any) => any | T
export type CrudWorkerHandler = CrudActions []
interface  CrudHandler <REQ = any, RES= any, NEXT= any> {
      path?: string,
      active: boolean;
      middlewares?: ((de: DEvent<REQ, RES, NEXT>) => any)[];
      before: CrudWorkerHandler,
      after:  CrudWorkerHandler
}

export interface ServiceConfig<REQ = any, RES= any, NEXT= any> {
  id_name: string;
  crud_path: string;
  crud?: {
    delete?: CrudHandler
    post?: CrudHandler
    get: CrudHandler
    all: CrudHandler
    patch?: CrudHandler;
    put?: CrudHandler
  };
}

export const DefaultDCrudValues = {
  delete: {
    path: "",
    active: true,
    middlewares: [],
    before: [],
    after : []
  },
  post: {
    path: "",
    active: true,
    middlewares: [],
    before: [],
    after : []
  },
  get: {
    path: "",
    active: true,
    middlewares: [],
    before: [],
    after : []
  },
  all: {
    path: "",
    active: true,
    middlewares: [],
    before: [],
    after : []
  },
  patch: {
    path: "",
    active: true,
    middlewares: [],
    before: [],
    after : []
  },
  put: {
    path: "",
    active: true,
    middlewares: [],
    before: [],
    after : []
  }
};
