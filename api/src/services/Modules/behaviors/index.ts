// behaviors barrel
import { auth, createService, DEvent } from '@App/damba.import';
import { Modules } from '../entities/Modules';
import { Application } from '@App/services/Application/entities/Application';
import { AppServices } from '@App/services/AppService/entities/AppServices';
import { CurrentSetting } from '@Common/Entity/UserDto';
import z from 'zod';

const api = createService('/modules', Modules, undefined, [auth.check(['user'])]);

export const ModuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
});

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
api.DPost(
  '/',
  async (e: DEvent) => {
    try {
      const form = e.in.body as Partial<Modules>;
      const id = e.in.payload?.id;
      if (!id) return e.out.status(500).json({ message: 'User ID not found in payload' });
      const s = (await e.in.extras.users.getCurrentSetting(e, id)) as CurrentSetting;
      if (!s) return e.out.status(500).json({ message: 'Current setting not found for the user' });
      const app = (await e.in.extras.applications.getAppById(e, s.appId)) as Application;
      if (!app) return e.out.status(500).json({ message: 'Application not found' });
      const m = await api.extras.modules.findModuleByNameForApp(e, form.name!, app.id!);
      if (m)
        return e.out.status(409).json({ message: `Module name already exists in <<${app.name}>>` });

      let mod: Modules = {
        name: form.name,
        description: form.description,
        application: app,
        projectId: s.projId,
        OrgId: s.orgId,
        created_by: id,
      };
      mod = await api.DSave(mod);
      return e.out.json(mod);
    } catch (error) {
      console.log(error);
      return e.out.status(500).json({ message: 'Internal Server Error', error });
    }
  },
  {
    findModuleByNameForApp: (e: DEvent, name: string, appId: string) => {
      return e.in.DRepository.DGet(
        Modules,
        {
          where: {
            name,
            application: {
              id: appId,
            },
          },
        },
        false,
      );
    },
    findModuleById: (e: DEvent, id: string) => {
      return e.in.DRepository.DGet(
        Modules,
        {
          where: {
            id,
          },
        },
        false,
      );
    },
  },
  [],
  {
    validators: {
      body: ModuleSchema,
    },
  },
);
export default api.done();
