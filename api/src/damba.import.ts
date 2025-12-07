/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBehaviors } from '@Damba/v1/service/DambaService';
import { IAppConfig } from "@Damba/v1/config/IAppConfig";
import { DambaRoute } from "@Damba/v1/route/DambaRoute";
import { IServiceProvider } from "@Damba/v1/service/IServiceDamba";
import { ServiceRegistry } from "@Damba/v1/service/ServiceRegistry";
import { DEvent as DambaEvent } from "@Damba/v1/service/DEvent";
import { Request, Response, NextFunction, Router } from 'express';
import { ServiceConfig } from '@Damba/v1/service/ServiceConfig';
import express from 'express';
import DambaApiDocNested from '@Damba/v1/route/DambaRouteDoc';



export const DambaServices = (_SPS_: IServiceProvider<Request, Response, NextFunction>, AppConfig?: IAppConfig) => {
  ServiceRegistry._init();
  const root = express.Router();
  const sub = express.Router();
  const { route, extras } =  DambaRoute<Request, Response, NextFunction, Router>({ root, sub }, _SPS_, AppConfig);
  const { doc } = DambaApiDocNested<Request, Response, NextFunction>(_SPS_, AppConfig);
  return { route, extras, doc }; 
}

export type DEvent = DambaEvent<Request, Response, NextFunction>;

export const createService = <T>(
  name: string,
  entity?: new (...args: any[]) => any,
  config?: ServiceConfig<Request, Response, NextFunction>,
  fmiddleware?: Array<(de: DEvent) => any>
) => {
  return createBehaviors<T, Request, Response, NextFunction>(
    name,
    entity,
    config,
    fmiddleware
  );
};