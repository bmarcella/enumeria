// behaviors barrel
import { createService, DEvent } from '@App/damba.import';
import { Modules } from '../entities/Modules';
import { Application } from '@App/services/Application/entities/Application';
import { AppServices } from '@App/services/AppService/entities/AppServices';

const api = createService('/modules', Modules);

api.DGet(
  '/:id/application',
  async (e: DEvent) => {
    const id = api?.params()?.id;
    // yourcode here
    const modules = await api.DFindAll({
      where: {
        application: {
          id,
        },
      },
    });
    return e.out.json(modules);
  },
  {
    async saveModuleTemplate(e: DEvent, app: Application) {
      try {
        let mod: Modules = {
          name: 'module_' + app.project?.id?.substring(0, 4) + '_' + app.id?.substring(0, 4),
          application: app,
          projectId: app.project?.id,
          OrgId: app.orgId,
          created_by: app.created_by,
        };
        mod = await e.in.DRepository.DSave(Modules, mod);
        return mod;
      } catch (error) {
        console.log(error);
      }
    },
  },
  [],
);

api.DGet(
  '/:id/service',
  async (e: DEvent) => {
    const id = api.params()?.id;
    const servs = await e.in.DRepository.DGet(
      AppServices,
      {
        where: {
          module: {
            id,
          },
        },
      },
      true,
    );
    e.out.send(servs);
  },
  {},
  [api.middlewares.DCheckIfExist],
);
export default api.done();
