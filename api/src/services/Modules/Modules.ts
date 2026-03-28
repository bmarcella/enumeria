/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from '@Damba/v2/service/DambaService';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { createModule, getAllServiceByModuleId, getModulesbyApplicationId } from './behaviors';
import { auth } from '@App/damba.import';
import { ModulesExtras } from './extras';
import z from 'zod';
import { Modules } from '@Database/entities/Modules';
import { DEvent } from '@Damba/v2/service/DEvent';

export const ModuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
});

/**
 * Service wiring
 */
const service = {
  name: '/modules',
  entity: Modules,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/:id/application': {
    method: Http.GET,
    behavior: getModulesbyApplicationId,
    middlewares: [auth?.check(['user'])],
    extras: ModulesExtras,
  },

  '/:id/service': {
    method: Http.GET,
    behavior: getAllServiceByModuleId,
    middlewares: [
      auth?.check(['user']),
      (e: DEvent, next: any) => e.in?.middlewares?.DCheckIfExist?.(e, next) ?? next?.(),
    ],
  },

  '/': {
    method: Http.POST,
    behavior: createModule,
    middlewares: [auth?.check(['user'])],
    // optional: keep validators metadata if your v2 runtime reads it
    config: {
      validators: { body: ModuleSchema },
    },
  },
};

export default createDambaService({ service, behaviors });
