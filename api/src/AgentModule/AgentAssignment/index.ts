// src/services/AgentAssignmentService.ts
import { AgentAssignment } from "@App/entities/agents/Agents";
import { OrgParams, CreateAssignmentBody } from "@App/Validators/agents";
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { createAssignmentBehavior, listAssignmentsBehavior, updateAssignmentBehavior } from "./behavior";

const service = {
  name: "/agent_assignments",
  entity: AgentAssignment,
} as DambaService;



const behaviors: BehaviorsChainLooper = {
  "/orgs/:orgId/create": {
    method: Http.POST,
    behavior: createAssignmentBehavior,
    config: { validators: { params: OrgParams, body: CreateAssignmentBody } },
  },
  "/orgs/:orgId/list": {
    method: Http.GET,
    behavior: listAssignmentsBehavior,
    config: { validators: { params: OrgParams } },
  },
  "/orgs/:orgId/:assignmentId": {
    method: Http.PUT,
    behavior: updateAssignmentBehavior,
    config: { validators: { params: OrgParams } },
  },
};

export default createDambaService({ service, behaviors });