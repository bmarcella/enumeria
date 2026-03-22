// src/services/AgentRunService.ts
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { AgentRun } from "@Database/entities/agents/contracts/Agents";
import { OrgParams, RunAgentBody } from "@Validators/contracts/AgentDefinitionValidators";
import { runAgentBehavior } from "./Behavior";

const service = {
  name: "/agent_runs",
  entity: AgentRun,
} as DambaService;


const behaviors: BehaviorsChainLooper = {
  "/orgs/:orgId/run": {
    method: Http.POST,
    behavior: runAgentBehavior,
    config: { validators: { params: OrgParams, body: RunAgentBody } },
  },
};

export default createDambaService({ service, behaviors });