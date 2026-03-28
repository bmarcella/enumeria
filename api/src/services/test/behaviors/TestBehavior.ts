import { DEvent } from '@App/damba.import';
import { NotFoundError } from '@Damba/v2/errors';
import { DEventHandler, DambaApi } from '@Damba/v2/service/DambaService';

export const getAllTests = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const tests = await api?.DFindAll({});
    e.out.send(tests);
  };
};

export const getTestById = (api?: DambaApi): DEventHandler => {
  return async (e: DEvent) => {
    const test = await api?.DFindOneById();
    if (!test) {
      throw new NotFoundError('Test not found');
    }
    e.out.send(test);
  };
};
