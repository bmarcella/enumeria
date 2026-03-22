import _Org from './Organization/behaviors';
import _Auth from './Auth/behaviors';
import _Proj from './Projects';
import _App from './Application/behaviors';
import _Mod from './Modules/Modules';
import _Box from './CanvasBox/behaviors';
import _User from './User/behaviors';
import _Serv from './AppService/behaviors';
import _Helper from './Damba';
import _AI from './AiAgentChat/AiChat';
import _SK from './Socket';
import { NextFunction, Request, Response } from 'express';
import { IServiceProvider } from '@Damba/v2/service/IServiceDamba';

export const _SPS_INDEX_: IServiceProvider<Request, Response, NextFunction> = {
  ..._Org,
  ..._Auth,
  ..._Proj,
  ..._App,
  ..._Mod,
  ..._Serv,
  ..._Box,
  ..._User,
  ..._Helper,
  ..._AI,
  ..._SK,
};
