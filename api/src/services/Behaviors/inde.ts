import { auth } from '@App/damba.import';
import {
  BehaviorsChainLooper,
  DambaService,
  createDambaService,
} from '@Damba/v2/service/DambaService';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { Behavior } from '@Database/entities/Behaviors';
import getBehaviorsByServiceId from './behaviors';

const service = {
  name: '/behaviors',
  entity: Behavior,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/:serviceId': {
    method: Http.GET,
    behavior: getBehaviorsByServiceId,
    middlewares: [auth?.check(['user'])],
  },
};

export default createDambaService({ service });
