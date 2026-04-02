/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from '@Damba/v2/service/DambaService';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Http } from '@Damba/v2/service/IServiceDamba';
import { auth } from '@App/damba.import';
import { getAllCodeFiles, getCodeFileByApplicationId, getCodeFileByProjectId } from './behavior';

/**
 * Service wiring
 */
const service = {
  name: '/code-files',
  entity: CodeFile,
} as DambaService;

const behaviors: BehaviorsChainLooper = {
  '/:projectId/application/:applicationId/:env': {
    method: Http.GET,
    behavior: getAllCodeFiles,
    middlewares: [auth?.check(['user'])],
  },
  '/:projectId': {
    method: Http.GET,
    behavior: getCodeFileByProjectId,
    middlewares: [auth?.check(['user'])],
  },
  '/:applicationId': {
    method: Http.GET,
    behavior: getCodeFileByApplicationId,
    middlewares: [auth?.check(['user'])],
  },
};

export default createDambaService({ service, behaviors });
