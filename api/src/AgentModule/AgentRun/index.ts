// src/services/AgentRunService.ts
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { AgentRun } from "@App/entities/agents/Agents";
import { OrgParams, RunAgentBody } from "@App/Validators/agents";
import { runAgentBehavior } from "./Behavior";
import Ajv from "ajv";
const ajv = new Ajv({ allErrors: true });

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