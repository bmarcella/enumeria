/* eslint-disable @typescript-eslint/no-unused-vars */

import { DEvent } from '@App/damba.import';
import { LoadFiles } from '@Damba/v2/helper/readFile';
import { DEventHandlerFactory } from '@Damba/v2/service/DambaService';

export const loadFilesBehavior: DEventHandlerFactory = () => {
  return async (e: DEvent) => {
    const files = await LoadFiles('common/Damba/v2');
    e.out.send(files);
  };
};
