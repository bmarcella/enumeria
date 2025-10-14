
import { AuthConfig } from "../config/auth";
import { ErrorMessage } from "../../../common/error/error";
import { createService, DEvent } from "../Damba/service/DambaService";
import { Organization } from "../entities/Organization";

const api = createService("/organizations", Organization);

api.DGet("/:id/user",  async (e: DEvent) => {
    try {
    const userId = e.in.params.id;
    if (!userId) return e.out.status(402).json({ error: ErrorMessage });

    const orgs = await e.in.DRepository.DGet(
        Organization,
        { where: { user: { id: userId } } },
        true
    );
    return e.out.json(orgs);
    } catch (error) {
        return e.out.status(500).json(error);
    }
}, {}, [ AuthConfig.protect(['user']) ])
export default api.done();


