// behaviors barrel

import { AppConfig } from '@App/config/app';
import { ErrorMessage } from '../../../../../common/error/error';
import { Organization } from '../entities/Organization';
import { createService, DEvent } from '@App/damba.import';
const auth = AppConfig.authoriztion;

const api = createService('/organizations', Organization, undefined, [
    auth.check(['user']),
]);

api.DGet(
  '/:id/user',
  async (e: DEvent) => {
    try {
      const userId = e.in.params.id;
      if (!userId) return e.out.status(402).json({ error: ErrorMessage });
      const orgs = await e.in.extras.organizations.getOrgByUserId(e, userId);
      return e.out.json(orgs);
    } catch (error) {
      return e.out.status(500).json(error);
    }
  },
  {
    getOrgById: async (e: DEvent, id: string) => {
      return await e.in.DRepository.DGet(Organization, { where: { id: id } }, false);
    },
    getOrgByUserId: async (e: DEvent, id: string) => {
      return await e.in.DRepository.DGet(Organization, { where: { user: { id: id } } }, true);
    },
  },
);
export default api.done();
