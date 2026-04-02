import { DEvent } from '@App/damba.import';
import { DambaApi } from '@Damba/v2/service/DambaService';

const getBehaviorsByServiceId = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { serviceId } = e.in.params;
    const behaviors = await api?.DFindAll({
      where: { appService: { id: serviceId } },
    });
    return e.out.send({ behaviors });
  };
};

export default getBehaviorsByServiceId;
