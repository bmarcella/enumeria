
import { NextFunction, Request, Response } from 'express';
import { IServiceProvider } from '@Damba/v2/service/IServiceDamba';
import AgentCatalog from './AgentCatalog';
import MarketPlace from './MarketPlace';
import License from './License';
import AgentAssignment from './AgentAssignment';
import AgentListing from './AgentListing';


export const _SPS_AGENT_MODULE_: IServiceProvider<Request, Response, NextFunction> = {
    ...AgentCatalog,
    ...MarketPlace,
    ...License,
    ...AgentAssignment,
    ...AgentListing
};
