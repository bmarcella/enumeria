// behaviors barrel

import { AuthConfig } from "../../../config/auth";
import { ErrorMessage } from "../../../../../common/error/error";
import { createBehaviors, DEvent } from "../../../Damba/service/v1/DambaService";
import { Organization } from "../entities/Organization";

const api = createBehaviors("/organizations", Organization, undefined, [ AuthConfig.protect(['user'])]);

api.DGet("/:id/user",  async (e: DEvent) => {
    try {
    const userId = e.in.params.id;
    if (!userId) return e.out.status(402).json({ error: ErrorMessage });

    const orgs = await e.in.extras.organizations.getOrgByUserId(e, userId);
    return e.out.json(orgs);
    } catch (error) {
        return e.out.status(500).json(error);
    }
}, {
    getOrgById : async (e: DEvent, id: string)=>{
        return await e.in.DRepository.DGet(
            Organization,
            { where:  { id: id }  },
            false
    );
    },
    getOrgByUserId : async (e: DEvent, id: string)=>{
             return  await e.in.DRepository.DGet(
                Organization,
                { where: { user: { id: id } } },
                true
            );
    }
})
export default api.done();


