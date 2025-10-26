
import { DambaRoute } from "./route/DambaRoute";
import { IServiceProvider, ServiceRegistry } from "./service/DambaService";
import { NextFunction, Request, Response } from "express";



export const DambaServices = (_SPS_ : IServiceProvider<Request, Response, NextFunction>) => {
    ServiceRegistry._init();
    return DambaRoute(_SPS_);
}