import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from '@Damba/v2/service/DambaService';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { addChatBehavior } from './behaviors';
import { agentRagQdrantBehavior } from './behaviors/AgentRag';

const service = {
  name: '/ai',
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/chat-2': {
    method: Http.POST,
    behavior: addChatBehavior,
  },
  '/chat': {
    method: Http.POST,
    behavior: agentRagQdrantBehavior,
  },
};

export default createDambaService({ service, behaviors });
