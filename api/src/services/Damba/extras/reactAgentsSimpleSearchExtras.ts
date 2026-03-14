import { DambaApi, DExtrasHandler, Extras } from '@Damba/v2/service/DambaService';

export const reactAgentSimpleSearchBehaviorExtras: Extras = (api?: DambaApi): DExtrasHandler => {
  return {
    getQuery() {
      return api?.params().query;
      },
    };
  };
