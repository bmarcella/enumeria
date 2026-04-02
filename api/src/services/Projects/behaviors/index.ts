/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorMessage } from '@Common/error/error';
import { CurrentSetting } from '@Damba/v2/Entity/UserDto';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { DEvent } from '@Damba/v2/service/DEvent';
import { Behavior, DambaApi } from '@Damba/v2/service/DambaService';
import {
  ApplicationDto,
  ProjectDto,
  ProjectDtoWithApps,
  UpdateProjectStepDto,
} from '../dtos/ProjectsDto';
import { Application } from '@Database/entities/Application';
import { Modules } from '@Database/entities/Modules';
import { AppServices } from '@Database/entities/AppServices';
import { BuildStatus, BuldingType, Project } from '@Database/entities/Project';
import { DQueues } from '@Common/Damba/core/Queues';

export const getMyProjects: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { userId } = e.in.data;
    const projects = await e.in.extras.projects.getMyProjects(userId, e);
    return e.out.json(projects);
  };
};

export const getMyOrgProjects: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { orgId } = e.in.data;
    const projects = await e.in.extras.projects.getMyOrgProjects(orgId, e);
    return e.out.json(projects);
  };
};

export const getApplicationsByProjectId: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const id_project = api?.params()?.id;
    if (!id_project) return e.out.status(401).json({ error: ErrorMessage.INVALID_URL_PARAMS });

    const { In } = await import('typeorm');
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
          type_app: In(['api', 'ui', 'microservice']),
        },
      },
      true,
    )) as any;
    return e.out.json(apps);
  };
};

export const deleteProjectById: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    try {
      const projectId = api?.params()?.id;
      if (!projectId) return e.out.status(400).json({ error: 'Missing project id' });

      const project = await e.in.DRepository.DGet1(Project, { where: { id: projectId } });
      if (!project) return e.out.status(404).json({ error: 'Project not found' });

      const { id: jobId } = await api!.enqueue(DQueues.DELETE_PROJECT, {
        projectId,
        requestId: e.in.requestId,
        userId: e.in.data?.userId,
      });
      return e.out.json({ queued: true, jobId, projectId });
    } catch (error) {
      return e.out.status(500).json({ error: 'Failed to queue project deletion', detail: error });
    }
  };
};

export const getStatsByProjectId: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    try {
      const id_project = api?.params()?.id;
      if (!id_project) return e.out.status(401).json({ error: ErrorMessage.INVALID_URL_PARAMS });

      const totalApps = await e.in.DRepository.DCount(Application, {
        where: { project: { id: id_project } },
      });

      const projects = (await e.in.DRepository.DGet(
        Project,
        {
          select: { id: true, contributors: true },
          where: { id: id_project },
        },
        true,
      )) as any[];

      const totalContributors = projects?.[0]?.contributors?.length || 0;

      return e.out.json({ totalApps, totalContributors });
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  };
};

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
  };
};

export const saveProjectWithApp: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    try {
      const { userId } = e.in.data;
      const form = e.in.body as ProjectDtoWithApps;
      const apps = form.applications as ApplicationDto[];
      const org = await e.in.data.organization;
      let proj = {
        name: form.name,
        description: form.description,
        environments: form.envs as DambaEnvironmentType[],
        organization: org,
        created_by: userId,
        buildingType: BuldingType.manual,
      } as Project;

      proj = (await api?.DSave(proj)) as any;
      if (!proj) return e.out.status(500).send({ message: ErrorMessage.INTERNAL_SERVER_ERROR });

      const packages: ApplicationDto[] = [
        {
          name: `${proj.name} - Database`,
          description: `Database package for ${proj.name}`,
          type_app: 'package-entities',
        },
        {
          name: `${proj.name} - Validators`,
          description: `Validators package for ${proj.name}`,
          type_app: 'package-validators',
        },
        {
          name: `${proj.name} - Policies & Middlewares`,
          description: `Policies & Middlewares package for ${proj.name}`,
          type_app: 'package-policies-middlewares',
        },
      ];
      apps.push(...packages);
      const newApps = await Promise.all(
        apps.map((app) => e.in.extras.applications.saveAppTemplateForProject(e, proj, app)),
      );
      const appsCreated = await api?.DRepository().DSaveMany(Application, newApps);
      const setting: CurrentSetting = {
        env: DambaEnvironmentType.DEV,
        orgId: org.id,
        projId: proj.id,
        appId: appsCreated?.[0]?.id,
        moduleId: '',
        servId: '',
      };
      e.in.extras.users.setCurrentSetting(e, userId, setting);
      return e.out.json({ project: proj, setting });
    } catch (error) {
      console.log(error);
      return e.out.status(500).json({ message: ErrorMessage.INTERNAL_SERVER_ERROR, error });
    }
  };
};

export const updateProjectStep: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    try {
      const projectId = api?.params()?.id;
      if (!projectId) return e.out.status(400).json({ error: 'Missing project id' });

      const body = e.in.body as UpdateProjectStepDto;
      if (!body.step) return e.out.status(400).json({ error: 'Missing step' });

      const project = await e.in.DRepository.DGet1(Project, { where: { id: projectId } });
      if (!project) return e.out.status(404).json({ error: 'Project not found' });

      const update: Partial<Project> = { lastCompletedStep: body.step };
      if (
        body.buildStatus &&
        Object.values(BuildStatus).includes(body.buildStatus as BuildStatus)
      ) {
        update.buildStatus = body.buildStatus as BuildStatus;
      }

      await e.in.DRepository.DUpdate(Project, { id: projectId }, update);
      return e.out.json({
        ok: true,
        lastCompletedStep: body.step,
        buildStatus: update.buildStatus,
      });
    } catch (error) {
      return e.out.status(500).json({ error: 'Failed to update project step', detail: error });
    }
  };
};
