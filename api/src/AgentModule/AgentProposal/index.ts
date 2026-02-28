// src/services/AgentProposalService.ts
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { AgentProposal } from "@App/entities/agents/AgentsConfig";
import { OrgParams, ProposalParams, DecideProposalBody } from "@App/Validators/agents";
import { decideProposalBehavior } from "./Behavior";


const service = {
  name: "/agent_proposals",
  entity: AgentProposal,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  "/orgs/:orgId/:proposalId/decide": {
    method: Http.POST,
    behavior: decideProposalBehavior,
    config: {
      validators: {
        params: OrgParams.merge(ProposalParams) as any,
        body: DecideProposalBody,
      },
    },
  },
};

export default createDambaService({ service, behaviors });