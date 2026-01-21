// behaviors barrel

import { AppConfig } from '@App/config/app.config';
import { ErrorMessage } from '../../../../../common/error/error';
import { Organization } from '../entities/Organization';
import { createService, DEvent } from '@App/damba.import';
const auth = AppConfig?.authoriztion;

const api = createService('/organizations', Organization, undefined, [auth?.check(['user'])]);

api.DGet(
  '/:id/user',
  async (e: DEvent) => {
    try {
      const userId = e.in.params.id;
      if (!userId) return e.out.status(402).json({ error: ErrorMessage, userId });
      const orgs = await e.in.extras.organizations.getOrgByUserId(e, userId);
      return e.out.json(orgs);
    } catch (error) {
      console.log(error);
      return e.out.status(500).json(error);
    }
  },
  {
    getOrgById: async (e: DEvent, id: string) => {
      return await api.DFindOne({ where: { id: id } });
    },
    getOrgByUserId: async (e: DEvent, id: string) => {
      return await api.DFindAll({ where: { user: { id: id } } });
    },
  },
);
export default api.done();
