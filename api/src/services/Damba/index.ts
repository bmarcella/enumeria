import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from '@Damba/v2/service/DambaService';
import {
  addChatBehavior,
  ChatPromptTemplateLangChain,
  reactAgentSimpleSearchBehavior,
  searchBehavior,
} from './behaviors/ReactAgent';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { reactAgentSimpleSearchBehaviorExtras } from './extras/reactAgentsSimpleSearchExtras';
import { getDambaCodeByVersion, loadFilesBehavior, saveDambaCode } from './behaviors/loadFiles';

const service = {
  name: '/helper',
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/react-agent/:query': {
    method: Http.GET,
    behavior: reactAgentSimpleSearchBehavior,
    extras: reactAgentSimpleSearchBehaviorExtras,
  },
  '/loadDFiles': {
    method: Http.GET,
    behavior: loadFilesBehavior,
  },
   '/saveDambaCode/:version': {
    method: Http.GET,
    behavior: saveDambaCode,
  },
  '/getDambaCode/:version': {
    method: Http.GET,
    behavior: getDambaCodeByVersion,
  },
  '/react-agent-2/:query': {
    method: Http.GET,
    behavior: ChatPromptTemplateLangChain,
  },
  '/search/:query': {
    method: Http.GET,
    behavior: addChatBehavior,
  },
  '/query/:query': {
    method: Http.GET,
    behavior: searchBehavior,
  },
};

export default createDambaService({ service, behaviors });
