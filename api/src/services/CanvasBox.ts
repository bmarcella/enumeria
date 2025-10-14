import { createService, DEvent } from '../Damba/service/DambaService';
const api = createService('/canvasboxes');
api.DGet('/idServ/service',   async (e: DEvent) => {
    // yourcode here
    return e.out.json();
}, {})
export default api.done();