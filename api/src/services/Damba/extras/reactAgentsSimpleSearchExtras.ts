import { DExtrasHandler, DambaApi, Extras } from '@Damba/v2/service/DambaService';
import { getQuery } from './Hook';

export const reactAgentSimpleSearchBehaviorExtras: Extras = (api?: DambaApi): DExtrasHandler => {
  return {
    getQuery: getQuery(api),
  };
};
