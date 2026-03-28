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
import _DataModeler from './DataModeler/behaviors';
import _UseCase from './UseCase/behaviors';
import _ProjectAccess from './ProjectAccess/behaviors';
import _Workspace from './Workspace/behaviors';
import { NextFunction, Request, Response } from 'express';
import { IModule, IServiceProvider } from '@Damba/v2/service/IServiceDamba';
import Test from './test/Test';

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
  ..._DataModeler,
  ..._UseCase,
  ..._ProjectAccess,
  ..._Workspace,
  ...Test,
};

export const indexModule: IModule<Request, Response, NextFunction> = {
  name: 'index',
  services: _SPS_INDEX_,
  middleware: [],
};
