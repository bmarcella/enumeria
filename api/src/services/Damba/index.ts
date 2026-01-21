/* eslint-disable @typescript-eslint/no-unused-vars */
import { createService } from '@App/damba.import';
import { Project } from '../Projects/entities/Project';
import { SimpleLangChain } from './behaviors/simpleLangChain';
import { ChatPromptTemplateLangChain } from './behaviors/ChatPromtTemplate';
import { BehaviorsChain } from '@Damba/v2/service/DambaService';
import { loadFilesBehavior } from './behaviors/loadFiles';

const api = createService('/helper');

const behaviors: BehaviorsChain = {
  chat: ChatPromptTemplateLangChain(api),
  simple: SimpleLangChain(),
  files: loadFilesBehavior(),
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

api.DGet('/files', behaviors.files, {});

export default api.done();
