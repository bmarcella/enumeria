import { NextFunction, Request, Response } from 'express';
import { IServiceProvider } from '@Damba/v2/service/IServiceDamba';
import AgentCatalog from './AgentCatalog';
import MarketPlace from './MarketPlace';
import License from './License';
import AgentAssignment from './AgentAssignment';
import AgentListing from './AgentListing';
import AgentDefinition from './AgentDefinition';
import ToolArtifacts from './ToolArtifacts';
import RunnableLambda from './RunnableLambda';


export const _SPS_AGENT_MODULE_: IServiceProvider<Request, Response, NextFunction> = {
    ...AgentDefinition,
    ...AgentCatalog,
    ...MarketPlace,
    ...License,
    ...AgentAssignment,
    ...AgentListing,
    ...ToolArtifacts,
    ...RunnableLambda
};
