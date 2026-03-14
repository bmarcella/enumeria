import { DambaRepository } from "../dao";
import { DEvent } from "./DEvent";
import {
  EventHandler,
  ServiceFn,
  IDActionConfig,
  IServiceProvider,
  AnyFn,
} from "./IServiceDamba";
import { QCtor } from "./QueuesBull";

export type DambaApiType<
  T = any,
  REQ = any,
  RES = any,
  NEXT = any,
  ENTITY extends new (...args: any[]) => any = new (...args: any[]) => any
> = {
  simple_service_name: string;
  Entity: ENTITY | undefined; // runtime "typeof entity" is not representable; see below note
  __redis: any;
  DRepository: () => DambaRepository;
  QueryBuilder: (name?: boolean) => any;
  on: <SK>(name: string, on: EventHandler<SK>) => void;
  DFindOne: (where: any) => Promise<any>;
  DFindAll: (where: any) => Promise<any>;
  DFindOneById: () => Promise<any>;
  setQueue: <NQ>(ctor: QCtor<NQ>) => void;
  queue: <NQ>(fullQueueName: string) => NQ;
  enqueue: <E>(
    fullQueueName: string,
    data: E,
    opts?: any,
    jobName?: string
  ) => Promise<{ id: string; full: any }>;

  middlewares: any;
  data: () => any;
  setData: (new_data: any) => void;

  body: () => any;
  params: () => any;
  query: () => any;

  DSave: (obj: any) => Promise<any>;

  DGet: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  DPost: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  DDelete: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  DPatch: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  DPut: (
    _path: string,
    _behavior: ServiceFn<REQ, RES, NEXT>[] | ServiceFn<REQ, RES, NEXT>,
    _extras?: Record<string, AnyFn>,
    _middleware?: ((de: DEvent<REQ, RES, NEXT>) => any)[],
    _config?: IDActionConfig
  ) => void;

  extras: any;

  done: () => IServiceProvider<REQ, RES, NEXT>;
};
