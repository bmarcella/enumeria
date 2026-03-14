// src/services/AgentRunService.ts
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from '@Damba/v2/service/DambaService';
import { AgentRun } from '@App/entities/agents/Agents';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { createRunnableLambdaBehavior, deleteRunnableLambdaBehavior, getRunnableLambdaBehavior, listRunnableLambdasBehavior, updateRunnableLambdaBehavior } from './behavior';
import { auth } from '@App/damba.import';
import { CreateRunnableLambdaBody, RunnableLambdaIdParams, UpdateRunnableLambdaBody } from './validators';
import { RunnableLambda } from '@App/entities/agents/ToolArtifactAndRunnableLambda';

const service = {
  name: '/runnable-lambdas',
  entity: RunnableLambda,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '': [
    {
    method: Http.POST,
    behavior: createRunnableLambdaBehavior,
    middlewares: [auth?.check(['user'])],
    config: { validators: { body: CreateRunnableLambdaBody } },
    },
    {
    method: Http.GET,
    behavior: listRunnableLambdasBehavior,
    middlewares: [auth?.check(['user'])]
    }
],
  '/:runnableLambdaId': [
  {
    method: Http.PATCH,
    behavior: updateRunnableLambdaBehavior,
    middlewares: [auth?.check(['user'])],
    config: { validators: { body: UpdateRunnableLambdaBody, params: RunnableLambdaIdParams } },
  },
  {
    method: Http.DELETE,
    behavior: deleteRunnableLambdaBehavior,
    middlewares: [auth?.check(['user'])],
    config: { validators: { params: RunnableLambdaIdParams } },
  } ,
  {
    method: Http.GET,
    behavior: getRunnableLambdaBehavior,
    middlewares: [auth?.check(['user'])],
    config: { validators: { params: RunnableLambdaIdParams } },
  } 
],
};

export default createDambaService({ service, behaviors });
