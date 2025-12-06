/* eslint-disable @typescript-eslint/no-unused-vars */
import { CurrentSetting } from '../../../../../common/Entity/UserDto';
import { createService, DEvent } from '@App/damba.import';
import { AuthConfig } from '@App/config/auth';
import { User } from '../entities/User';

const api = createService('/users', User, undefined,
    [
        AuthConfig.protect(['user']),
    ]
);
api.DPost('/currentSetting', async (e: DEvent) => {
    const data = api.body();
    console.log(data);
    // const id = e.in.payload?.id;
    // if (!id) return e.out.status(500).send({ message: ErrorMessage.NOT_FOUND });
    // const conf = await api.extras.setCurrentSetting(e, id, data);
    return e.out.json(data);
}, {
    setCurrentSetting: async (e: DEvent, id, data: CurrentSetting,) => {
        return await e.in.DRepository.DUpdate(User, {
            id
        }, {
            currentSetting: data
        })
    }
})
export default api.done();