import { createService } from "../Damba/service/DambaService";
import { ErrorMessage } from "../../../common/error/error";
import { Project } from "../entities/Project";

const api = createService("/projects", Project);
api.DGet("/idOrg:/Organization/iduser/user", async (req, res) => {
    const userId = req.session.user?.id || "de300fce-3435-4341-9f59-bb1b723f1cda";
    if (!userId) return res.status(401).json({ error: ErrorMessage });
    return res.json(userId);
}, {})

api.DPost("/", async (req, res) => {
    const userId = req.session.user?.id || "de300fce-3435-4341-9f59-bb1b723f1cda";
    if (!userId) return res.status(401).json({ error: ErrorMessage });
    return res.json(userId);
}, {})
export default api.done();