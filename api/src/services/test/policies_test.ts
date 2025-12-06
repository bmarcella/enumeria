/* eslint-disable @typescript-eslint/no-unused-vars */
import { DEvent } from "@App/damba.import";
import { must_have_org_access, must_be_admin } from "../../policies";
import { applyPolicies, policyMiddleware } from "@Damba/v1/policies";
import { createBehaviors } from "@Damba/v1/service/DambaService";


export const CreateProject = async (e: DEvent) => {
  await applyPolicies(e, must_have_org_access, must_be_admin);
  if (e.out.headersSent) return; // a policy already responded
};



const api = createBehaviors("/projects");


export default api.done();

const api_2 = createBehaviors(
  "/projects",
  undefined,
  undefined,
  [policyMiddleware(must_have_org_access)]
);
