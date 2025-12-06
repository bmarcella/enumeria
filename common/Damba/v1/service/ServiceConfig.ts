/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEvent } from "./DEvent";

export interface ServiceConfig<REQ, RES , NEXT> {
    id_name: string,
    crud?: {
        delete?: {
            active : boolean,
            middlewares:  ((de: DEvent<REQ, RES , NEXT>) => any)[] 
        },
        post?: {
            active : boolean,
            middlewares:  ((de: DEvent<REQ, RES , NEXT>) => any)[] 
        },
        get: {
            active : boolean,
            middlewares:  ((de: DEvent<REQ, RES , NEXT>) => any)[] 
        };
        patch?: {
            active : boolean,
            middlewares:  ((de: DEvent<REQ, RES , NEXT>) => any)[] 
        },
        put?: {
            active : boolean,
            middlewares:  ((de: DEvent<REQ, RES , NEXT>) => any)[] 
        },
    }
}

export const DefaultDCrudValues = {
                delete: {
                    active: true,
                    middlewares: []
                },
                post: {
                    active: true,
                    middlewares: []
                },
                get: {
                    active: true,
                    middlewares: [],
                },
                patch: {
                    active: true,
                    middlewares: []
                },
                put: {
                    active: true,
                    middlewares: []
                },
}