/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createService, DEvent } from '@App/damba.import';
import { Application } from '../../../entities/Application';
import { Project } from '@App/entities/Project';

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
    async save(app: Partial<Application>) {
      return await api.DSave(app);
    },
    async getAppById(e: DEvent, id) {
      return e.in.DRepository.DGet(Application, { where: { id } }, false);
    },
  },
);

export default api.done();
