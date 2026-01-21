/* eslint-disable @typescript-eslint/no-unused-vars */
import { CurrentSetting } from '../../../../../common/Entity/UserDto';
import { createService, DEvent } from '@App/damba.import';
import { User } from '../entities/User';
import { AppConfig } from '@App/config/app.config';
const auth = AppConfig.authoriztion;
const api = createService('/users', User, undefined, [auth?.check(['user'])]);

api.DGet(
  '/metaSetting',
  async (e: DEvent) => {
    return e.out.json({});
  },
  {},
);

api.DPost(
  '/metaSetting',
  async (e: DEvent) => {
    //     const data = e.in.body;
    //     console.log(data);
    //     // const id = e.in.payload?.id;
    //     // if (!id) return e.out.status(500).send({ message: ErrorMessage.NOT_FOUND });
    //     // const conf = await api.extras.setCurrentSetting(e, id, data);
    return e.out.json({});
  },
  {
    setCurrentSetting: async (e: DEvent, id, data: CurrentSetting) => {
      return await e.in.DRepository.DUpdate(
        User,
        {
          id,
        },
        {
          currentSetting: data,
        },
      );
    },

    getCurrentSetting: async (e: DEvent, id) => {
      const qb = e.in.DRepository.QueryBuilder(User, 'u');
      return qb.select('u.currentSetting').where('u.id = :id', { id }).getRawOne();
    },
  },
);
export default api.done();
