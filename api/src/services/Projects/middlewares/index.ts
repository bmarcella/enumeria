
import { DEvent } from "@Damba/service/DambaService";
import { ErrorMessage } from "../../../../../common/error/error";

export const CheckIfOrgAndUserExist =  async (e: DEvent) => {

    const userId = e.in.params.id_user;
    const orgId =  e.in.params.id_org;
    if (!userId || !orgId) return e.out.status(402).json({ error: ErrorMessage });
    e.in.data = {
        userId,
        orgId
    }
    e.go();
}

export const GetCurrentOrg =  async (e: DEvent) => {
    const orgId =  e.in.data.orgId;
    const org = e.in.extras.organizations.getOrgById(e, orgId);
    if(!org) e.out.sendStatus(404).send({error: ErrorMessage.ORG_NOT_FOUND})
    e.in.data = {...e.in.data, organization: org }
    e.go();
}