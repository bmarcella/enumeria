import { createService, DEvent } from "../Damba/service/DambaService";

const api = createService('/modules');
api.DGet('/:idApp/appplication', async (e: DEvent) => {
    // yourcode here
    return e.out.json();

}, {})
export default api.done();