// behaviors barrel
import { createBehaviors } from '@Damba/service/v1/DambaService';
import { DEvent } from '@Damba/service/v1/DEvent';

const api = createBehaviors('/invitations');

api.DGet('/', async (e: DEvent) => {
    // yourcode here
    return e.out.json();
}, {})
export default api.done();