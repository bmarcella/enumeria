import { createService, DEvent } from "../Damba/service/DambaService";
import { ErrorMessage } from "../../../common/error/error";
import { Project } from "../entities/Project";

const api = createService("/projects", Project);

api.DGet("/id_org:/Organization/id_user/user", async (e: DEvent) => {
    const userId = e.in.params.id_user;
    const orgId = e.in.params.id_org;
    if (!userId || !orgId) return e.out.status(402).json({ error: ErrorMessage });
    return e.out.json(userId);
}, {})

api.DPost("/", async (e: DEvent) => {
    return e.out.json({});
}, {})
export default api.done();