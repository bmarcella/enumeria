import _Org from "./behaviors/Organization";
import _Auth from "./behaviors/Auth"
import _Proj from "./behaviors/Project"
import _App from "./behaviors/Application"
import _Mod from "./behaviors/AppModule"
import _Box from "./behaviors/CanvasBox"
import _Test from "./behaviors/Test"
import {
    NextFunction,
    Request,
    Response,
} from 'express';
import { IServiceProvider } from "src/Damba/service/DambaService";

export const _SPS_: IServiceProvider<Request, Response, NextFunction> = {
    ..._Org,
    ..._Auth,
    ..._Proj,
    ..._App,
    ..._Mod,
    ..._Box,
     ..._Test,

}