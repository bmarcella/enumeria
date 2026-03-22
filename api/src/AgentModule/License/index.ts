// src/services/AgentLicenseService.ts
import { License } from "@Database/entities/agents/contracts/Agents";
import { OrgParams, InstallAgentBody, PurchaseAgentBody } from "@Validators/contracts/AgentDefinitionValidators";
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { installFreeAgentBehavior, purchaseOneTimeBehavior, listOrgLibraryBehavior } from "./Behavoir";


const service = {
  name: "/agent_licenses",
  entity: License,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  "/orgs/:orgId/install": {
    method: Http.POST,
    behavior: installFreeAgentBehavior,
    config: { validators: { params: OrgParams, body: InstallAgentBody } },
  },
  "/orgs/:orgId/purchase": {
    method: Http.POST,
    behavior: purchaseOneTimeBehavior,
    config: { validators: { params: OrgParams, body: PurchaseAgentBody } },
  },
  "/orgs/:orgId/library": {
    method: Http.GET,
    behavior: listOrgLibraryBehavior,
    config: { validators: { params: OrgParams } },
  },
};

export default createDambaService({ service, behaviors });