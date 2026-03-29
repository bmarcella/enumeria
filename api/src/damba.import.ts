import { AppConfig } from './config/app.config';
import { DEvent as DambaEvent } from '@Damba/v2/service/DEvent';
import { createBehaviors } from '@Damba/v2/service/DambaService';
import { ServiceConfig } from '@Damba/v2/service/ServiceConfig';
import { NextFunction, Request, Response } from 'express';
export type DEvent = DambaEvent<Request, Response, NextFunction>;
export const auth = AppConfig.authorization;

export const createService = <T>(
  name: string,
  entity?: new (...args: any[]) => any,
  config?: ServiceConfig<Request, Response, NextFunction>,
  fmiddleware?: Array<(de: DEvent) => any>,
) => {
  return createBehaviors<T, Request, Response, NextFunction>(name, entity, config, fmiddleware);
};
