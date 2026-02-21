import _AI from './AiAgentChat/AiChat';
import { NextFunction, Request, Response } from 'express';
import { IServiceProvider } from '@Damba/v2/service/IServiceDamba';

export const _SPS_: IServiceProvider<Request, Response, NextFunction> = {
  ..._AI,
};
