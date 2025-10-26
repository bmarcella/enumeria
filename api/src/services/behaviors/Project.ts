/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBehaviors, DEvent } from "../../Damba/service/DambaService";
import { Project } from "../../entities/Project";
import { CheckIfOrgAndUserExist, GetCurrentOrg } from "../middlewares/MWProject";

const api = createBehaviors("/projects", Project);



api.DGet("/:id_org/organization/:id_user/user", async (e: DEvent) => {
 //   const { userId, orgId } = e.in.data;

    return e.out.json(e.in.data);
}, {}, [
    CheckIfOrgAndUserExist
] )

api.DPost("/:id_org/organization/:id_user/user", async (e: DEvent) => {
    const { userId } = e.in.data;
    const form = e.in.body as {
        name: string,
        description: string;
    };
    const  org =  await e.in.data.organization;
    let proj = {
        name : form.name,
        description: form.description,
        organization: org,
        created_by: userId
    } as Project;
    proj  =  await e.in.DRepository.DSave(Project, proj) as any; 
    return e.out.json(proj);
}, {} , 
  [CheckIfOrgAndUserExist, GetCurrentOrg ]
)
export default api.done();