import { IServiceProvider } from "./IServiceDamba";


/* eslint-disable @typescript-eslint/no-explicit-any */
export class ServiceRegistry<Request, Response, NextFunction> {
    private services: IServiceProvider<Request, Response, NextFunction> = {}
    public static _instance: any;
    constructor() { }
    static _init() {
        if (!this._instance) {
            this._instance = new ServiceRegistry();
        }
        return this._instance;
    }

    public populate = (path: string, service: any) => {
        this.services[path] = service;
    }
    public get() {
        return this.services;
    }
}