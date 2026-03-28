import { Application } from '@Database/entities/Application';
import { Modules } from '@Database/entities/Modules';
import { Extras, DambaApi, DExtrasHandler } from '@Damba/v2/service/DambaService';
import { DEvent } from '@Damba/v2/service/DEvent';

export const ModulesExtras: Extras = (api?: DambaApi): DExtrasHandler => {
  return {
    async saveModuleTemplate(e: DEvent, app: Application) {
      try {
        let mod: Modules = {
          name: 'module_' + app.project?.id?.substring(0, 4) + '_' + app.id?.substring(0, 4),
          application: app,
          projId: app.project?.id,
          orgId: app.orgId,
          created_by: app.created_by,
        };
        mod = await e.in.DRepository.DSave(Modules, mod);
        return mod;
      } catch (error) {
        console.log(error);
      }
    },
    findModuleByNameForApp: (e: DEvent, name: string, appId: string) => {
      return e.in.DRepository.DGet(
        Modules,
        {
          where: {
            name,
            application: {
              id: appId,
            },
          },
        },
        false,
      );
    },
    findModuleById: (e: DEvent, id: string) => {
      return e.in.DRepository.DGet(
        Modules,
        {
          where: {
            id,
          },
        },
        false,
      );
    },
  };
};
