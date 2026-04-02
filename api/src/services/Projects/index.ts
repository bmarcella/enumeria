import {
  BehaviorsChainLooper,
  DambaService,
  createDambaService,
} from '@Damba/v2/service/DambaService';
import {
  getApplicationsByProjectId,
  getMyOrgProjects,
  getMyProjects,
  getStatsByProjectId,
  saveProject,
  deleteProjectById,
  saveProjectWithApp,
  updateProjectStep,
} from './behaviors';
import { ProjectsExtras } from './extras';
import { Http } from '@Damba/v2/service/IServiceDamba';
import {
  CheckIfOrgAndUserExist,
  CheckIfOrgExist,
  CheckIfUserExist,
  GetCurrentOrg,
} from './middlewares';
import { Project } from '@Database/entities/Project';

const service = {
  name: '/projects',
  entity: Project,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/:id_org/organization': [
    {
      method: Http.GET,
      behavior: getMyOrgProjects,
      extras: ProjectsExtras,
      middlewares: [CheckIfOrgExist],
      config: {
        description: 'Get project by id org and id user',
      },
    },
    {
      method: Http.POST,
      behavior: saveProject,
      middlewares: [CheckIfOrgAndUserExist, GetCurrentOrg],
      config: {
        description: 'Save project',
      },
    },
  ],
  '/:id_user/user': {
    method: Http.GET,
    behavior: getMyProjects,
    extras: ProjectsExtras,
    middlewares: [CheckIfUserExist],
    config: {
      description: 'Get project by id org and id user',
    },
  },
  '/:id/applications': {
    method: Http.GET,
    behavior: getApplicationsByProjectId,
    extras: ProjectsExtras,
    config: {
      description: 'Get project by id org and id user',
    },
  },
  '/:id/stats': {
    method: Http.GET,
    behavior: getStatsByProjectId,
    extras: ProjectsExtras,
    config: {
      description: 'Get project stats by id',
    },
  },
  '/:id': [
    {
      method: Http.DELETE,
      behavior: deleteProjectById,
      config: {
        description: 'Queue deletion of a project and all its hierarchy',
      },
    },
    {
      method: Http.PATCH,
      behavior: updateProjectStep,
      config: {
        description: 'Update project last completed step and build status',
      },
    },
  ],
  ':id_org/organization/:id_user/user': {
    method: Http.POST,
    behavior: saveProjectWithApp,
    middlewares: [CheckIfOrgAndUserExist, GetCurrentOrg],
    config: {
      description: 'Save project',
    },
  },
};

export default createDambaService({ service, behaviors });
