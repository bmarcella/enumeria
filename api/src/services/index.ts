import _Org from "./Organization/behaviors";
import _Auth from "./Auth/behaviors"
import _Proj from "./Projects/behaviors"
import _App from "./Application/behaviors"
import _Mod from "./Modules/behaviors"
import _Box from "./CanvasBox/behaviors"
import _User from "./User/behaviors"
import _Test from "./test/Test"
import _Serv from "./AppService/behaviors"
import {
    NextFunction,
    Request,
    Response,
} from 'express';
import { IServiceProvider } from "@Damba/service/v1/DambaService";

export const _SPS_: IServiceProvider<Request, Response, NextFunction> = {
    ..._Org,
    ..._Auth,
    ..._Proj,
    ..._App,
    ..._Mod,
    ..._Serv,
    ..._Box,
    ..._User,
     ..._Test,
}