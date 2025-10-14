import _Org from "../services/Organization";
import _Auth from "../services/Auth"
import _Proj from "../services/Project"
import _App from "../services/Application"
import _Mod from "../services/AppModule"
import _Box from "../services/CanvasBox"
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
}