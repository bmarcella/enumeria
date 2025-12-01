// behaviors barrel
import { createBehaviors, DEvent } from '@Damba/service/v1/DambaService';

const api = createBehaviors('/invitations');
api.DGet('/', async (e: DEvent) => {
    // yourcode here
    return e.out.json();
}, {})
export default api.done();