import { DEvent } from "@App/damba.import";
import { Application } from "@Database/entities/Application";
import { Project } from "@Database/entities/Project";
import { Extras, DambaApi, DExtrasHandler } from "@Damba/v2/service/DambaService";

export const ProjectsExtras: Extras = (api?: DambaApi): DExtrasHandler => {
  return {
    getProjectByIdOrgAndIdUser: async (userId, orgId, e: DEvent) => {
        return await e.in.DRepository.DGet(
            Project,
            {
            where: {
                created_by: userId,
                organization: {
                id: orgId,
                },
            },
            },
            true,
        );
        },

        countProjectByIdOrgAndIdUser: async (userId, orgId, e: DEvent) => {
        return await e.in.DRepository.DCount(Project, {
            where: {
            created_by: userId,
            organization: {
                id: orgId,
            },
            },
        });
        },

     async save(app: Partial<Application>) {
        return await api?.DSave(app);
     }
     
    }
  };