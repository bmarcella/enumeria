import { BehaviorsChainLooper, DambaService, createDambaService } from "@Damba/v2/service/DambaService";
import { getApplicationsByProjectId, getProjectByIdOrgAndIdUser, getStatsByProjectId, saveProject } from "./behaviors";
import { ProjectsExtras } from "./extras";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { CheckIfOrgAndUserExist, GetCurrentOrg } from "./middlewares";

const service = {
  name: '/projects'
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/:id_org/organization/:id_user/user' : [ 
    {
    method: Http.GET,
    behavior: getProjectByIdOrgAndIdUser,
    extras: ProjectsExtras,
    middlewares: [CheckIfOrgAndUserExist],
    config: {
      description: "Get project by id org and id user"
    }
  }, 
  {
    method: Http.POST,
    behavior: saveProject,
    middlewares:   [CheckIfOrgAndUserExist, GetCurrentOrg],
    config: {
      description: "Save project"
    }
  } 
],
"/:id/applications": {
    method: Http.GET,
    behavior: getApplicationsByProjectId,
    extras: ProjectsExtras,
    config: {
      description: "Get project by id org and id user"
    }
},
"/:id/stats": {
    method: Http.GET,
    behavior: getStatsByProjectId,
    extras: ProjectsExtras,
    config: {
      description: "Get project stats by id"
    }
}

}

export default createDambaService({ service, behaviors });