/* eslint-disable @typescript-eslint/no-unused-vars */
// behaviors barrel

import { createService, DEvent } from '@App/damba.import';
import { AppServices } from '../entities/AppServices';
import { Modules } from '@App/services/Modules/entities/Modules';
import { Entities } from '@App/services/CanvasBox/entities/CanvasBox';
import { CheckEnv } from '@App/services/Projects';

const api = createService('/services', AppServices);

api.DPost(
  '/',
  async (e: DEvent) => {
    const data = api.body;
    const obj = e.in.extras.services.save(data);
    // yourcode here
    return e.out.json(obj);
  },
  {
    async save(data: Partial<AppServices>) {
      return await api.DSave(data);
    },
    async saveServicesTemplate(e: DEvent, mod: Modules, name?: string) {
      try {
        const serv: AppServices = {
          name: name ? name : 'Services_' + mod?.id?.substring(0, 4),
          orgId: mod.OrgId,
          projectId: mod.projectId,
          applicationId: mod.application?.id,
          module: mod,
          created_by: mod.created_by,
        };
        return await e.in.DRepository.DSave(AppServices, serv);
      } catch (error) {
        console.log(error);
      }
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
