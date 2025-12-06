
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorMessage } from "../../../../../common/error/error";
import { Application } from "../entities/Application";
import { createService, DEvent } from "../../../damba.import";
import { Project } from "@App/services/Projects/entities/Project";

const api = createService("/applications", Application);

api.DGet("/:id_projects/projects", async (e: DEvent) => {
  const id_project = api.params()?.id_projects;
  if (!id_project) return e.out.status(401).json({ error: ErrorMessage.INVALID_URL_PARAMS });
  const apps = await e.in.DRepository.DGet(Application, {
    select: {
      id: true,
      name: true,
      type_app: true
    },
    where: {
      project: {
        id: id_project
      }
    }
  }, true) as any;

  return e.out.json(apps);
},
  {
    async saveAppTemplate(e: DEvent, proj: Project) {
      console.log(proj);
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
          orgId: proj.organization.id
        };
        app = await e.in.DRepository.DSave(Application, app);
        return app;
      } catch (error) {
        console.log(error);
      }

    },
    async save(app: Partial<Application>) {
      return await api.DSave(app);
    }
  });





export default api.done();