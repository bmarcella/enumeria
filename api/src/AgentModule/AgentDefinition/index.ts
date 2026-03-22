// src/services/AgentDefinitionService.ts
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";

import { Http } from "@Damba/v2/service/IServiceDamba";



import { AgentDefinition } from "@Database/entities/agents/contracts/Agents";
import { approveAgentDefinitionBehavior, createAgentDefinitionBehavior, delistAgentDefinitionBehavior, getAgentDefinitionBehavior, getAgentsDefinitionsBehavior, rejectAgentDefinitionBehavior, submitAgentDefinitionBehavior, updateAgentDefinitionBehavior, updateAgentManifestBehavior } from "./Behavior";
import { AppConfig } 
from "@App/config/app.config";
import { AgentIdParams, ApprovalListingDefaults, CreateAgentDefinitionBody, ModerationBody, UpdateAgentDefinitionBody } from "@Validators/contracts/AgentDefinitionValidators";

const auth = AppConfig.authoriztion;

const service = {
  name: "/agent_definitions",
  entity: AgentDefinition,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  "/": [{
    method: Http.POST,
    behavior: createAgentDefinitionBehavior,
    config: { validators: { body: CreateAgentDefinitionBody } },
    middlewares: [auth?.check(['user'])]
  },
  {
    method: Http.GET,
    behavior: getAgentsDefinitionsBehavior,
    middlewares: [auth?.check(['user'])]
  }
],
  "/:agentDefinitionId": [
    {
      method: Http.PUT,
      behavior: updateAgentDefinitionBehavior,
      config: { validators: { params: AgentIdParams, body: UpdateAgentDefinitionBody } },
    },
     {
      method: Http.PATCH,
      behavior: updateAgentDefinitionBehavior,
      config: { validators: { params: AgentIdParams, body: UpdateAgentDefinitionBody } },
    },
    {  
      method: Http.GET,
      behavior: getAgentDefinitionBehavior,
      config: { validators: { params: AgentIdParams } },
    }
],
  "/:agentDefinitionId/submit": {
    method: Http.POST,
    behavior: submitAgentDefinitionBehavior,
    config: { validators: { params: AgentIdParams } },
  },
  "/:agentDefinitionId/delist": {
    method: Http.POST,
    behavior: delistAgentDefinitionBehavior,
    config: { validators: { params: AgentIdParams } },
  },
  "/:agentDefinitionId/approve": {
    method: Http.POST,
    behavior: approveAgentDefinitionBehavior,
    config: { validators: { params: AgentIdParams, body: ApprovalListingDefaults } },
  },
  "/:agentDefinitionId/reject": {
    method: Http.POST,
    behavior: rejectAgentDefinitionBehavior,
    config: { validators: { params: AgentIdParams, body: ModerationBody } },
  },
   "/:agentDefinitionId/updateManifest": {
    method: Http.PATCH,
    behavior: updateAgentManifestBehavior
  }
};

export default createDambaService({ service, behaviors });