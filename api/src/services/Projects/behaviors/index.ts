
import { ErrorMessage } from "@Common/error/error";
import { CurrentSetting } from "@Damba/v2/Entity/UserDto";
import { DambaEnvironmentType } from "@Damba/v2/Entity/env";
import { DEvent } from "@Damba/v2/service/DEvent"
import { Behavior, DambaApi } from "@Damba/v2/service/DambaService"
import { ProjectDto } from "../dtos/ProjectsDto";
import { Application } from "@Database/entities/Application";
import { Modules } from "@Database/entities/Modules";
import { AppServices } from "@Database/entities/AppServices";
import { Project } from "@Database/entities/Project";


export const getMyProjects: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { userId } = e.in.data;
    const projects = await e.in.extras.projects.getMyProjects(userId, e);
    return e.out.json(projects);
  }
}

export const getMyOrgProjects: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { orgId } = e.in.data;
    const projects = await e.in.extras.projects.getMyOrgProjects(orgId, e);
    return e.out.json(projects);
  }
}

export const saveProject: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
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

      proj = (await api?.DSave(proj)) as any;
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
      proj = (await api?.DSave(proj)) as any;

      const setting: CurrentSetting = {
        env: DambaEnvironmentType.DEV,
        orgId: org.id,
        projId: proj.id,
        appId: app?.id,
        moduleId: mod.id,
        servId: serv.id,
      };
      e.in.extras.users.setCurrentSetting(e, userId, setting);
      return e.out.json({ project: proj, setting });
    } catch (error) {
      console.log(error);
      return e.out.status(500).json({ message: ErrorMessage.INTERNAL_SERVER_ERROR, error });
    }
   
  }
}

export const getApplicationsByProjectId: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const id_project = api?.params()?.id;
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
  }
}

export const getStatsByProjectId: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
     try {
      const id_project = api?.params()?.id;
      if (!id_project) return e.out.status(401).json({ error: ErrorMessage.INVALID_URL_PARAMS });

      const totalApps = await e.in.DRepository.DCount(Application, {
        where: { project: { id: id_project } },
      });

      const projects = await e.in.DRepository.DGet(Project, {
        select: { id: true, contributors: true },
        where: { id: id_project },
      }, true) as any[];

      const totalContributors = projects?.[0]?.contributors?.length || 0;

      return e.out.json({ totalApps, totalContributors });
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  }
}
    