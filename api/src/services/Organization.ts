
import { ErrorMessage } from "../../../common/error/error";
import { createService } from "../Damba/service/DambaService";
import { Organization } from "../entities/Organization";

const api = createService("/organizations", Organization);
api.DGet("/:id/user", async (req, res) => {
    const userId = req.session.user?.id || "de300fce-3435-4341-9f59-bb1b723f1cda";
    if (!userId) return res.status(401).json({ error: ErrorMessage });

    const orgs = await req.DRepository.DGet(
        Organization,
        { where: { user: { id: userId } } },
        true
    );
    return res.json(orgs);
}, {})
export default api.done();


