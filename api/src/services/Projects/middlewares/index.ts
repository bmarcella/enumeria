/* eslint-disable @typescript-eslint/no-explicit-any */

import { DEvent } from "@Damba/service/v1/DambaService";
import { ErrorMessage } from "../../../../../common/error/error";
import { DambaEnvironmentType } from "../../../../../common/Entity/env";
import { Project } from "../entities/Project";


const isDambaEnvironmentType = (value: any): value is DambaEnvironmentType => {
    return Object.values(DambaEnvironmentType).includes(value);
}

export const checkIfProjectExist =  async (e: DEvent) => {
    const id_projects = e.in.params.id_projects;
    const projects = e.in.DRepository.DGet(Project, {
        where : {
            id: id_projects
        }
    }) as any; 
    if(!projects) e.out.sendStatus(404).send({error: ErrorMessage.NOT_FOUND})
    e.in.data['projects'] = projects;
    e.go();
}

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

export const CheckEnv =  async (e: DEvent) => {
    const env = e.in.params.env;
    if (!isDambaEnvironmentType(env)) {
        return e.out.status(400).json({ error: `Invalid environment: ${env}` });
    }
    e.go();
}