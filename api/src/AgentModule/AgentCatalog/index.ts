// src/services/AgentCatalogService.ts
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { AgentListing } from "@App/entities/agents/Agents";
import { BrowseAgentsQuery } from "@App/Validators/agents";
import { browseAgentsBehavior, getAgentBehavior } from "./Behavior";

const service = {
  name: "/agent_catalog",
  entity: AgentListing,
} as DambaService;



const behaviors: BehaviorsChainLooper = {
  "/marketplace/agents": {
    method: Http.GET,
    behavior: browseAgentsBehavior,
    config: { validators: { query: BrowseAgentsQuery } },
  },
  "/marketplace/agents/:agentDefinitionId": {
    method: Http.GET,
    behavior: getAgentBehavior,
  },
};

export default createDambaService({ service, behaviors });