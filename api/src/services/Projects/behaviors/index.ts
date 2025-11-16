
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBehaviors, DEvent } from "@Damba/service/DambaService";
import { Project } from "../entities/Project";
import { CheckIfOrgAndUserExist, GetCurrentOrg } from "../middlewares";
import { AuthConfig } from '../../../config/auth';
import { Application } from "services/Application/entities/Application";
import { DambaEnvironmentType } from "../../../../../common/Entity/env";
import { ProjectDto } from "../dtos/ProjectsDto";

// Type guard for DambaEnvironmentType
const isDambaEnvironmentType = (value: any): value is DambaEnvironmentType => {
    return Object.values(DambaEnvironmentType).includes(value);
};

const api = createBehaviors("/projects", Project, undefined, [
    AuthConfig.protect(['user'])
]);



api.DGet("/:id_org/organization/:id_user/user", async (e: DEvent) => {
    const { userId, orgId } = e.in.data;
    const projects = await e.in.extras.projects.getProjectByIdOrgAndIdUser(userId, orgId, e);
    return e.out.json(projects);
}, {
    getProjectByIdOrgAndIdUser :async  (userId, orgId, e: DEvent) => {
       return await e.in.DRepository.DGet(Project, 
              { 
                where: { 
                created_by : userId,
                organization : {
                    id : orgId
                }
               }
            },
            true
        );
    },

    countProjectByIdOrgAndIdUser :async  (userId, orgId, e: DEvent) => {
       return await e.in.DRepository.DCount(Project, 
              { where: { 
                created_by : userId,
                organization : {
                    id : orgId
                }
                }}
        );
    }
}, [
    CheckIfOrgAndUserExist
] )

// SAVE NEW PROJECT
api.DPost("/:id_org/organization/:id_user/user", async (e: DEvent) => {
    const { userId } = e.in.data;
    const form = e.in.body as ProjectDto;
    const  org =  await e.in.data.organization;
    let proj = {
        name : form.name,
        description: form.description,
        environments: form.envs as DambaEnvironmentType[],
        selectedEnv: form.envs[0],
        organization: org,
        created_by: userId,
    } as Project;

    // Save template App
    const app = e.in.extras.applications.getAppTemplate(userId, proj.environments) as Application
    proj.applications = [app];
    proj  =  await e.in.DRepository.DSave(Project, proj) as any; 
    e.in.extras.user.setCurrentProject(userId, proj.id, e);
    return e.out.json(proj);
}, 
 {
   
} , 
  [CheckIfOrgAndUserExist, GetCurrentOrg ]
);



// SAVE NEW PROJECT
api.DGet("/:id_proj/:new_env", async (e: DEvent) => {
    const id = e.in.params.id_proj;
    const env = e.in.params.new_env;

    // Verify env is a valid DambaEnvironmentType
    if (!isDambaEnvironmentType(env)) {
        return e.out.status(400).json({ error: `Invalid environment: ${env}` });
    }
    // update selected env
    let obj = await  api.DFindOne(e, {
            where :{
                id: id
            }
         });
    obj.selectedEnv = env as DambaEnvironmentType;
    obj = await api.DSave(e, obj);
    return e.out.json(obj);
}, 
 {

} , 
  [ ]
)
export default api.done();