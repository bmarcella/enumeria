/* eslint-disable @typescript-eslint/no-unused-vars */
import { applyPolicies, policyMiddleware } from "@Damba/policies/v1";
import { createBehaviors, DEvent } from "@Damba/service/v1/DambaService";
import { must_have_org_access, must_be_admin } from "../../policies";


export const CreateProject = async (e: DEvent) => {
  await applyPolicies(e, must_have_org_access, must_be_admin);
  if (e.out.headersSent) return; // a policy already responded
};



const api = createBehaviors("/projects");

api.DPost(
  "/",
  async (e: DEvent) => { /* create logic */ },
  /* extras */ {},
  /* middleware */ [policyMiddleware(must_have_org_access, must_be_admin)]
);

export default api.done();

const api_2 = createBehaviors(
  "/projects",
  undefined,
  undefined,
  [policyMiddleware(must_have_org_access)]
);
