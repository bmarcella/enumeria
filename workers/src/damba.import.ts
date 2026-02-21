/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBehaviors } from '@Damba/v2/service/DambaService';
import { IAppConfig } from '@Damba/v2/config/IAppConfig';
import { DambaRoute } from '@Damba/v2/route/DambaRoute';
import { IServiceProvider } from '@Damba/v2/service/IServiceDamba';
import { ServiceRegistry } from '@Damba/v2/service/ServiceRegistry';
import { DEvent as DambaEvent } from '@Damba/v2/service/DEvent';
import { Request, Response, NextFunction, Router } from 'express';
import { ServiceConfig } from '@Damba/v2/service/ServiceConfig';
import express from 'express';
import DambaApiDocNested from '@Damba/v2/route/DambaRouteDoc';
import { DataSource } from 'typeorm';
import { AppConfig } from './config/app.config';

export const DambaServices = (
  _SPS_: IServiceProvider<Request, Response, NextFunction>,
  AppConfig?: IAppConfig<DataSource>,
) => {
  ServiceRegistry._init();
  const root = express.Router();
  const { route, extras } = DambaRoute<Request, Response, NextFunction, Router>(
    { root, express },
    _SPS_,
    AppConfig,
  );
  const { doc } = DambaApiDocNested<Request, Response, NextFunction>(_SPS_, AppConfig);
  return { route, extras, doc };
};

export type DEvent = DambaEvent<Request, Response, NextFunction>;
export const createService = <T>(
  name: string,
  entity?: new (...args: any[]) => any,
  config?: ServiceConfig<Request, Response, NextFunction>,
  fmiddleware?: Array<(de: DEvent) => any>,
) => {
  return createBehaviors<T, Request, Response, NextFunction>(name, entity, config, fmiddleware);
};

export const auth = AppConfig.authoriztion;
