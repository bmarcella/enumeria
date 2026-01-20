/* eslint-disable @typescript-eslint/no-unused-vars */
import { createService } from '@App/damba.import';
import { Project } from '../Projects/entities/Project';
import { SimpleLangChain } from './behaviors/simpleLangChain';
import { ChatPromptTemplateLangChain } from './behaviors/ChatPromtTemplate';
import { BehaviorsChain } from '@Damba/v2/service/DambaService';

const api = createService('/test', Project);

const behaviors: BehaviorsChain = {
  chat: ChatPromptTemplateLangChain(api),
  simple: SimpleLangChain(),
};

api.DGet('/langchain', behaviors.simple, {
  getName: () => {
    return 'Asgard';
  },
});

api.DGet('/chat/:subject', behaviors.chat, {
  getName: () => {
    return 'Asgard';
  },
});

export default api.done();
