/* eslint-disable @typescript-eslint/no-unused-vars */


/* eslint-disable @typescript-eslint/no-explicit-any */

// behaviors barrel
import { DambaAttributesTemplate } from '../../../../../common/Entity/DambApp';
import { v4 as uuidv4 } from 'uuid';
import { Entities } from '../entities/CanvasBox';
import { createService, DEvent } from '@App/damba.import';
import { AuthConfig } from '@App/config/auth';

const api = createService('/entities', Entities, undefined, [
  AuthConfig.protect(['user']),
]);

api.DPost('/', async (e: DEvent) => {
  let data = api.body() as Partial<Entities>;
  const id = e.in.payload?.id;
  data = {
    ...data,
    created_by: id
  }
  const entity = await api.DSave(data);
  return e.out.json(entity);
}
);


api.DPost('/:id', async (e: DEvent) => {
  const data = api.body() as Partial<Entities>;
  const id = e.in.payload?.id;
  let entity = await e.in.data.entities as Partial<Entities>;
  entity.updated_by = id;
  entity.updated_at = new Date();
  entity = {
    ...entity,
    ...data
  };
  entity = await api.DSave(entity);
  return e.out.json(entity);
}, {}, [
  api.middlewares.DCheckIfExist
]
);

api.DPost('/default', async (e: DEvent) => {
  const data = api.body();
  let cb = await e.in.extras.entities.saveEntity(e, data);
  cb = await e.in.extras.entities.addUpdate(e, cb);
  return e.out.json(cb);
},
  {
    async getAttTemplate(cb: Entities) {
      const createAttributes = () => ({
        ...structuredClone(DambaAttributesTemplate),
        id: uuidv4(),
        created_at: cb.created_at,
        created_by: cb.created_by,
      });

      return createAttributes();
    }
    ,
    async saveEntity(e: DEvent, { created_by, projectId, appId, moduleId, serviceId, orgId }) {
      let cb = new Entities();
      cb.orgId = orgId;
      cb.created_by = created_by,
        cb.appId = appId,
        cb.moduleId = moduleId;
      cb.servId = serviceId;
      cb.projId = projectId;
      cb = await e.in.DRepository.DSave(Entities, cb);
      return cb;
    },
    async addUpdate(e: DEvent, cb: Entities) {
      const data = e.in.extras.entities.getAttTemplate(cb);
      cb.attributes = data;
      cb = await e.in.DRepository.DSave(Entities, cb);
      return cb;
    }

  })
export default api.done();

