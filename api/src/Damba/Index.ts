
import { IAppConfig } from "./config/v1/IAppConfig";
import { DambaRoute } from "./route/v1/DambaRoute";
import { IServiceProvider, ServiceRegistry } from "./service/v1/DambaService";
import { NextFunction, Request, Response } from "express";


export const DambaServices = (_SPS_ : IServiceProvider<Request, Response, NextFunction>, AppConfig?: IAppConfig) => {
    ServiceRegistry._init();
    return DambaRoute(_SPS_, AppConfig);
}