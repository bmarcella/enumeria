import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from '@Damba/v2/service/DambaService';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { Test } from '@Database/entities/Test';
import { getAllTests, getTestById } from './behaviors/TestBehavior';
import z from 'zod';

const service = {
  name: '/test',
  entity: Test,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/': {
    method: Http.GET,
    behavior: getAllTests,
  },
  '/:id': {
    method: Http.GET,
    behavior: getTestById,
    config: {
      validators: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
  },
};

export default createDambaService({ service, behaviors });
