/* eslint-disable @typescript-eslint/no-explicit-any */
import { EnvironmentLabels } from '@Damba/v2/Entity/env';
import { DambaRepository } from '@Damba/v2/dao';
import { Application } from '@Database/entities/Application';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';

export const saveApplications = async (
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<Application[]> => {
  const environments = project.environments ?? [];

  return Promise.all(
    environments.map(
      (env) =>
        dao.DSave(Application, {
          name: `${project.name} - ${EnvironmentLabels[env] ?? env}`,
          description: `${env} application for ${project.name}`,
          type_app: 'api',
          project: project,
          projId: project.id,
          orgId: (project as any).organization?.id,
          environment: env,
          version: 1,
          created_by: project.created_by,
        } as Partial<Application>) as Promise<Application>,
    ),
  );
};
