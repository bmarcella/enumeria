import { createService, DEvent } from '../Damba/service/DambaService';
const api = createService('/services');
api.DGet('/:idMod/module', async (e: DEvent) => {
    // yourcode here
    return e.out.json();
}, {})
export default api.done();