/* eslint-disable @typescript-eslint/no-unused-vars */
// behaviors barrel

import { auth, createService, DEvent } from '@App/damba.import';
import { AppServices } from '@Database/entities/AppServices';
import { Entities } from '@Database/entities/CanvasBox';
import { CurrentSetting } from '@Damba/v2/Entity/UserDto';
import { Application } from '@Database/entities/Application';
import { Modules } from '@Database/entities/Modules';
import { CheckEnv } from '@App/services/Projects/middlewares';

const api = createService('/services', AppServices, undefined, [auth?.check(['user'])]);

api.DPost(
  '/',
  async (e: DEvent) => {
    try {
      const form = e.in.body as Partial<AppServices>;
      const id = e.in.payload?.id;

      if (!id) return e.out.status(409).json({ message: 'User ID not found in payload' });

      const s = (await e.in.extras.users.getCurrentSetting(e, id)) as CurrentSetting;
      if (!s) return e.out.status(409).json({ message: 'Current setting not found for the user' });
      const app = (await e.in.extras.applications.getAppById(e, s.appId)) as Application;
      if (!app) return e.out.status(409).json({ message: 'Application not found' });
      const m = await api.extras.modules.findModuleById(e, app.id!);
      if (!m) return e.out.status(409).json({ message: 'Module not found' });
      const serv = await api.extras.services.findServiceByNameForModule(e, form.name!, app.id!);
      if (serv)
        return e.out.status(409).json({ message: `Service name already exists in <<${m.name}>>` });

      const data: AppServices = {
        name: form.name,
        description: form.description,
        module: m,
        appId: app.id,
        projId: s.projId,
        orgId: s.orgId,
        created_by: id,
      };

      const obj = e.in.extras.services.save(data);
      return e.out.json(obj);
    } catch (error) {
      console.log(error);
      return e.out.status(500).json({ message: 'Internal Server Error', error });
    }
  },
  {
    async save(data: Partial<AppServices>) {
      return await api.DSave(data);
    },
    async saveServicesTemplate(e: DEvent, mod: Modules, name?: string) {
      try {
        const serv: AppServices = {
          name: name ? name : 'Services_' + mod?.id?.substring(0, 4),
          orgId: mod.orgId,
          projId: mod.projId,
          appId: mod.application?.id,
          module: mod,
          created_by: mod.created_by,
        };
        return await e.in.DRepository.DSave(AppServices, serv);
      } catch (error) {
        console.log(error);
      }
    },
    async findServiceByNameForModule(e: DEvent, name: string, moduleId: string) {
      return e.in.DRepository.DGet(
        AppServices,
        {
          where: {
            name,
            module: {
              id: moduleId,
            },
          },
        },
        false,
      );
    },
  },
);

api.DGet(
  '/:id/entity/:env/env',
  async (e: DEvent) => {
    const servId = api.params()?.id;
    const env = api.params()?.env;
    const objs = await e.in.DRepository.DGet(
      Entities,
      {
        where: {
          env,
          servId,
        },
      },
      true,
    );
    e.out.send(objs);
  },
  {},
  [api.middlewares.DCheckIfExist, CheckEnv],
);

export default api.done();
