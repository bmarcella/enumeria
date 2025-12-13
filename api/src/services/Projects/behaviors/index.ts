/* eslint-disable @typescript-eslint/no-explicit-any */
import { Project } from '../entities/Project';
import { CheckIfOrgAndUserExist, GetCurrentOrg } from '../middlewares';
import { DambaEnvironmentType } from '../../../../../common/Entity/env';
import { ProjectDto } from '../dtos/ProjectsDto';
import { CurrentSetting } from '../../../../../common/Entity/UserDto';
import { ErrorMessage } from '../../../../../common/error/error';
import { createService, DEvent } from '@App/damba.import';
import { Application } from '@App/services/Application/entities/Application';
import { Modules } from '@App/services/Modules/entities/Modules';
import { AppServices } from '@App/services/AppService/entities/AppServices';
import { AppConfig } from '@App/config/app';

const auth = AppConfig.authoriztion;

const api = createService('/projects', Project, undefined, [auth.check(['user'])]);

api.DGet(
  '/:id_org/organization/:id_user/user',
  async (e: DEvent) => {
    const { userId, orgId } = e.in.data;
    const projects = await e.in.extras.projects.getProjectByIdOrgAndIdUser(userId, orgId, e);
    return e.out.json(projects);
  },
  {
    getProjectByIdOrgAndIdUser: async (userId, orgId, e: DEvent) => {
      return await e.in.DRepository.DGet(
        Project,
        {
          where: {
            created_by: userId,
            organization: {
              id: orgId,
            },
          },
        },
        true,
      );
    },

    countProjectByIdOrgAndIdUser: async (userId, orgId, e: DEvent) => {
      return await e.in.DRepository.DCount(Project, {
        where: {
          created_by: userId,
          organization: {
            id: orgId,
          },
        },
      });
    },
  },
  [CheckIfOrgAndUserExist],
);

// SAVE NEW PROJECT
api.DPost(
  '/:id_org/organization/:id_user/user',
  async (e: DEvent) => {
    try {
      const { userId } = e.in.data;
      const form = e.in.body as ProjectDto;
      const org = await e.in.data.organization;
      let proj = {
        name: form.name,
        description: form.description,
        environments: form.envs as DambaEnvironmentType[],
        organization: org,
        created_by: userId,
      } as Project;

      proj = (await api.DSave(proj)) as any;
      if (!proj) return e.out.status(500).send({ message: ErrorMessage.INTERNAL_SERVER_ERROR });

      // Save template App
      const app = (await e.in.extras.applications.saveAppTemplate(e, proj)) as Application;
      if (!app)
        return e.out
          .status(500)
          .send({ message: ErrorMessage.INTERNAL_SERVER_ERROR, entity: 'Application' });
      const mod = (await e.in.extras.modules.saveModuleTemplate(e, app)) as Modules;
      if (!mod)
        return e.out
          .status(500)
          .send({ message: ErrorMessage.INTERNAL_SERVER_ERROR, entity: 'Module' });
      const serv = (await e.in.extras.services.saveServicesTemplate(e, mod)) as AppServices;
      if (!serv)
        return e.out
          .status(500)
          .send({ message: ErrorMessage.INTERNAL_SERVER_ERROR, entity: 'Service' });
      proj = (await api.DSave(proj)) as any;

      const setting: CurrentSetting = {
        env: DambaEnvironmentType.DEV,
        orgId: org.id,
        projId: proj.id,
        appId: app.id,
        moduleId: mod.id,
        servId: serv.id,
      };
      e.in.extras.users.setCurrentSetting(e, userId, setting);
      return e.out.json({ project: proj, setting });
    } catch (error) {
      console.log(error);
      return e.out.status(500).json({ message: ErrorMessage.INTERNAL_SERVER_ERROR, error });
    }
  },
  {},
  [CheckIfOrgAndUserExist, GetCurrentOrg],
);

// UPDATE ENV OF PROJECTS
// api.DGet("/:id/:env", async (e: DEvent) => {
//     const env = e.in.params.env;
//     let obj = await api.data().projects;
//     obj.selectedEnv = env as DambaEnvironmentType;
//     obj = await api.DSave(obj);
//     return e.out.json(obj);
// },
//     {

//     },
//     [api.middlewares.DCheckIfExist, CheckEnv]
// )

api.DGet(
  '/:id/applications',
  async (e: DEvent) => {
    const id_project = api.params()?.id;
    if (!id_project) return e.out.status(401).json({ error: ErrorMessage.INVALID_URL_PARAMS });
    const apps = (await e.in.DRepository.DGet(
      Application,
      {
        select: {
          id: true,
          name: true,
          type_app: true,
        },
        where: {
          project: {
            id: id_project,
          },
        },
      },
      true,
    )) as any;

    return e.out.json(apps);
  },
  {
    async save(app: Partial<Application>) {
      return await api.DSave(app);
    },
  },
);
export default api.done();
