import { _SPS_ } from "./../../../../api/src/services/index";
const _SPS_Example = `
import _Test from './test/Test';
import { NextFunction, Request, Response } from 'express';
import { IServiceProvider } from '@Damba/v2/service/IServiceDamba';

export const _SPS_: IServiceProvider<Request, Response, NextFunction> = {
  ..._Test,
};`;
export default _SPS_Example;
