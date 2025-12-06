/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '../entities/User';
import { CurrentSetting } from '../../../../../common/Entity/UserDto';
import { createService, DEvent } from '@App/damba.import';
import { AuthConfig } from '@App/config/auth';

const api = createService('/users', User, undefined,
    [
        AuthConfig.protect(['user']),
    ]
);
api.DPost('/currentSetting', async (e: DEvent) => {
    const data = api.body();
    const id = e.in.payload?.id;
    const conf = await e.in.extras.users.setCurrentSetting(e, id, data);
    return e.out.json(conf);
}, {
    setCurrentSetting: async (e: DEvent, idUser, data: CurrentSetting,) => {
        await e.in.DRepository.DUpdate(User, {
            id: idUser
        }, {
            currentSetting: data
        })
    }
})
export default api.done();