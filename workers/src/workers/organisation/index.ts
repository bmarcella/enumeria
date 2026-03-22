import { DambaRepository } from "@Damba/v2/dao";
import { Organization } from "@Database/entities/Organization";
import { DataSource } from "typeorm";

export const getOrganisationById = async (organisationId: string, dao: DambaRepository<DataSource>) => {
    const organisation = await dao.DGet1(Organization, {
         where: {
            id: organisationId
         }
    });
    if (!organisation) {
        throw new Error(`Organisation not found: ${organisation}`);
    }
    return organisation;
}
 