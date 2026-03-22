// src/services/AgentDefinitionService.ts
import { ToolArtifact } from '@Database/entities/agents/contracts/ToolArtifactAndRunnableLambda';
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from '@Damba/v2/service/DambaService';

import { Http } from '@Damba/v2/service/IServiceDamba';
import {
  createToolArtifactBehavior,
  getToolArtifactBehavior,
  listToolArtifactsBehavior,
  updateToolArtifactBehavior,
} from './behavior';
import { CreateToolArtifactBody, ToolArtifactIdParams, UpdateToolArtifactBody } from '../../../../packages/validators/src/contracts/ToolArtefactValidators';
import { auth } from '@App/damba.import';

const service = {
  name: '/tool_artifacts',
  entity: ToolArtifact,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '': [
    {
    method: Http.POST,
    behavior: createToolArtifactBehavior,
    middlewares: [auth?.check(['user'])],
    config: { validators: { body: CreateToolArtifactBody } },
    },
    {
      method: Http.GET,
      behavior: listToolArtifactsBehavior,
      middlewares: [auth?.check(['user'])],
    },
  ],
  '/:toolArtifactId': [
    {
      method: Http.PATCH,
      behavior: updateToolArtifactBehavior,
      middlewares: [auth?.check(['user'])],
      config: {
        validators: {
          body: UpdateToolArtifactBody,
          params: ToolArtifactIdParams,
        },
      },
    },
    {
      method: Http.GET,
      behavior: getToolArtifactBehavior,
      middlewares: [auth?.check(['user'])],
      config: {
        validators: {
          params: ToolArtifactIdParams,
        },
      },
    },
  ],
};

export default createDambaService({ service, behaviors });
