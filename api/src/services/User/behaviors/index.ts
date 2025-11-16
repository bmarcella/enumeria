// behaviors barrel
// behaviors barrel
import { createBehaviors, DEvent } from '@Damba/service/DambaService';

const api = createBehaviors('/users');
api.DGet('/', async (e: DEvent) => {
    // yourcode here
    return e.out.json();
}, {})
export default api.done();