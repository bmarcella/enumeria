import _Org from "./Organization/behaviors";
import _Auth from "./Auth/behaviors"
import _Proj from "./Projects/behaviors"
import _App from "./Application/behaviors"
import _Mod from "./Modules/behaviors"
import _Box from "./CanvasBox/behaviors"
import _User from "./User/behaviors/User"
import _Test from "./test/Test"
import {
    NextFunction,
    Request,
    Response,
} from 'express';
import { IServiceProvider } from "@Damba/service/DambaService";

export const _SPS_: IServiceProvider<Request, Response, NextFunction> = {
    ..._Org,
    ..._Auth,
    ..._Proj,
    ..._App,
    ..._Mod,
    ..._Box,
    ..._User,
     ..._Test,
}