import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from '@Damba/v2/service/DambaService';
import { reactAgentSimpleSearchBehavior } from '../Damba/behaviors/ReactAgent';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { Test } from '@Database/entities/Test';

const service = {
  name: '/builder',
  entity: Test,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/react-agent-simple-search': {
    method: Http.GET,
    behavior: reactAgentSimpleSearchBehavior,
  },
};

export default createDambaService({ service, behaviors });
