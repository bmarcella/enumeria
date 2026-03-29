import { Http } from '@Damba/v2/service/IServiceDamba';
import z from 'zod';
import {
  BehaviorsChainLooper,
  DEventHandler,
  DExtrasHandler,
  DambaApi,
  DambaService,
  ExtraHook,
  Extras,
  createDambaService,
} from '@Damba/v2/service/DambaService';
import { DEvent } from '@App/damba.import';
import { NotFoundError } from '@Damba/v2/errors';

// behaviorHook code sourcce
export const getTestById = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const test = await api?.DFindOneById();
    if (!test) {
      throw new NotFoundError('Test not found');
    }
    e.out.send(test);
  };
};

export const saveTest = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const test: any = {};
    test.name = e.in.body.name;
    test.description = e.in.body.description;
    const obj = await api?.DSave(test);
    if (!obj) {
      throw new NotFoundError('Test not found');
    }
    e.out.send(obj);
  };
};

// this is a behaviorHook
const BehaviorHook_1 = {
  '/:id': {
    // method name
    method: Http.GET,
    // code source
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

// THIS IS A BEHAVIOR CHAIN
const BehaviorChain_1 = {
  '/:id': [
    {
      // method name
      method: Http.GET,
      // code source
      behavior: getTestById,
      config: {
        validators: {
          body: z.object({
            name: z.string(),
            description: z.string(),
          }),
        },
      },
    },
    {
      // method name
      method: Http.POST,
      // code source
      behavior: getTestById,
      config: {
        validators: {
          params: z.object({
            id: z.string(),
          }),
        },
      },
    },
  ],
};

// this is a behaviorChain
const behaviors: BehaviorsChainLooper = {
  ...BehaviorHook_1,
  ...BehaviorChain_1,
};

// extrat part

export const getQuery: ExtraHook = (api?: DambaApi) => {
  return () => {
    return api?.params().query;
  };
};

export const SERVICE_EXTRAS: Extras = (api?: DambaApi): DExtrasHandler => {
  return {
    getQuery: getQuery(api),
  };
};

// SERVICE PART
const service = {
  name: '/service',
} as DambaService;

export default createDambaService({
  service,
  behaviors,
  extras: SERVICE_EXTRAS,
});
