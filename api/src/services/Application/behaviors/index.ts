/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createService, DEvent } from '@App/damba.import';
import { Application } from '@Database/entities/Application';
import { Project } from '@Database/entities/Project';
import { Modules } from '@Database/entities/Modules';
import { BehaviorChain } from '@Database/entities/Behaviors/BehaviorChain';
import { Extra } from '@Database/entities/Extra';
import { ErrorMessage } from '@Common/error/error';
import { ApplicationDto } from '@App/services/Projects/dtos/ProjectsDto';

const api = createService('/applications', Application);

api.DGet(
  '/',
  async (e: DEvent) => {
    return e.out.json({});
  },
  {
    async saveAppTemplate(e: DEvent, proj: Project) {
      try {
        let app = {
          name: 'App_' + proj?.id?.substring(0, 8),
          host: 'localhost',
          port: 8080,
          version: 1,
          created_by: proj.created_by,
          secretKey: undefined,
          type_app: 'api',
          language: 'typescript',
          runtime: 'node18',
          project: proj,
          orgId: proj.organization.id,
        };
        app = await e.in.DRepository.DSave(Application, app);
        return app;
      } catch (error) {
        console.log(error);
      }
    },
    async saveAppTemplateForProject(e: DEvent, proj: Project, appDto: ApplicationDto) {
      try {
        let app = {
          name: appDto.name,
          host: appDto?.host,
          port: appDto.port,
          version: 1,
          created_by: proj.created_by,
          secretKey: undefined,
          type_app: appDto.type_app,
          language: 'typescript',
          runtime: 'node18',
          projId: proj.id,
          project: proj,
          orgId: proj.organization.id,
          description: appDto.description,
          framework: 'damba',
          frameworkVersion: 'v2',
        } as Partial<Application>;
        return app;
      } catch (error) {
        console.log(error);
      }
    },
    async save(app: Partial<Application>) {
      return await api.DSave(app);
    },
    async getAppById(e: DEvent, id: string) {
      return e.in.DRepository.DGet(Application, { where: { id } }, false);
    },
  },
);

// === APP TREE ===
api.DGet('/:appId/tree', async (e: DEvent) => {
  try {
    const { appId } = e.in.params;
    const modules = (await e.in.DRepository.DGet(
      Modules,
      {
        where: { application: { id: appId } },
        relations: { services: true },
        order: { created_at: 'ASC' },
      },
      true,
    )) as any[];

    if (!modules) return e.out.json([]);

    const tree = await Promise.all(
      (modules as any[]).map(async (mod: any) => {
        const services = mod.services || [];

        const serviceNodes = await Promise.all(
          services.map(async (svc: any) => {
            // Fetch behavior chains with behaviors and hooks
            const chains = (await e.in.DRepository.DGet(
              BehaviorChain,
              {
                where: { appService: { id: svc.id } },
                relations: {
                  behaviors: { hooks: true },
                },
                order: { created_at: 'ASC' },
              },
              true,
            )) as any[];

            // Fetch extras with hooks
            const extras = (await e.in.DRepository.DGet(
              Extra,
              {
                where: { appService: { id: svc.id } },
                relations: { extra_hooks: true },
                order: { created_at: 'ASC' },
              },
              true,
            )) as any[];

            return {
              ...svc,
              behaviorChains: chains || [],
              extras: extras || [],
            };
          }),
        );

        return {
          id: mod.id,
          name: mod.name,
          description: mod.description,
          codeFileContent: mod.codeFileContent,
          services: serviceNodes,
        };
      }),
    );

    return e.out.json(tree);
  } catch (error) {
    console.error('App tree error:', error);
    return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
  }
});

export default api.done();
