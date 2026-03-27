import { Application } from '@Database/entities/Application';
import { AppServices } from '@Database/entities/AppServices';
import { Modules } from '@Database/entities/Modules';
import { CurrentSetting } from '@Damba/v2/Entity/UserDto';
import { Behavior, DambaApi, DEventHandler } from '@Damba/v2/service/DambaService';
import { DEvent } from '@Damba/v2/service/DEvent';

export const getModulesbyApplicationId: Behavior = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const id = api?.params()?.id;
    // yourcode here
    const modules = await api?.DFindAll({
      where: {
        application: {
          id,
        },
      },
    });
    return e.out.json(modules);
  };
};

export const getAllServiceByModuleId: Behavior = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const id = api?.params()?.id;
    const servs = await e.in.DRepository.DGet(
      AppServices,
      {
        where: {
          module: {
            id,
          },
        },
      },
      true,
    );
    e.out.send(servs);
  };
};

export const createModule: Behavior = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    try {
      const form = e.in.body as Partial<Modules>;
      const id = e.in.payload?.id;
      if (!id) return e.out.status(500).json({ message: 'User ID not found in payload' });
      const s = (await e.in.extras.users.getCurrentSetting(e, id)) as CurrentSetting;
      if (!s) return e.out.status(500).json({ message: 'Current setting not found for the user' });
      const app = (await e.in.extras.applications.getAppById(e, s.appId)) as Application;
      if (!app) return e.out.status(500).json({ message: 'Application not found' });
      const m = await api?.extras.modules.findModuleByNameForApp(e, form.name!, app.id!);
      if (m)
        return e.out.status(409).json({ message: `Module name already exists in <<${app.name}>>` });

      let mod: Modules = {
        name: form.name,
        description: form.description,
        application: app,
        projId: s.projId,
        orgId: s.orgId,
        created_by: id,
      };
      mod = await api?.DSave(mod);
      return e.out.json(mod);
    } catch (error) {
      console.log(error);
      return e.out.status(500).json({ message: 'Internal Server Error', error });
    }
  };
};
