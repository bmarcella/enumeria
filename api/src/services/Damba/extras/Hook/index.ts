import { DambaApi, ExtraHook } from '@Damba/v2/service/DambaService';

export const getQuery: ExtraHook = (api?: DambaApi) => {
  return () => {
    return api?.params().query;
  };
};
