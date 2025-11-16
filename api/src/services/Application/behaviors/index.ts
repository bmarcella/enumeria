/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBehaviors, DEvent } from "@Damba/service/DambaService";
import { ErrorMessage } from "../../../../../common/error/error";
import { v4 as uuidv4 } from 'uuid';
import { DambaAttributesTemplate, DambaEntityTemplate, DambaServiceTemplate, DambaModuleTemplate } from "../../../../../common/Entity/DambApp";
import { DambaEnvironmentType } from "../../../../../common/Entity/env";
import { Application } from "../entities/Application";

const api = createBehaviors("/applications");

api.DGet("/:id_project/project/:env/environnement", async (e: DEvent) => {
    const id_project = e.in.params.id_project;
    const env = e.in.params.env;
    if (!id_project) return e.out.status(401).json({ error: ErrorMessage });
    const apps  =  await e.in.DRepository.DGet(Application, {
        where : {
           project: {
            id : id_project
           }
        }
    }, true) as any; 

    return e.out.json(apps);
}, 
 {
  getAppTemplate : (owner : string, envs : DambaEnvironmentType[] ) => {
          const date = new Date();

  const createAttributes = () => ({
    ...structuredClone(DambaAttributesTemplate),
    id: uuidv4(),
    created_at: date,
    created_by: owner,
  });

  const createEntity = () => ({
    ...structuredClone(DambaEntityTemplate),
    id: uuidv4(),
    created_at: date,
    created_by: owner,
    attributes: [createAttributes()],
  });

  const createService = () => ({
    ...structuredClone(DambaServiceTemplate),
    id: uuidv4(),
    created_at: date,
    created_by: owner,
    canvasBoxes: [createEntity()],
  });

  const createModule = () => ({
    ...structuredClone(DambaModuleTemplate),
    id: uuidv4(),
    created_at: date,
    created_by: owner,
    services: [createService()],
  });

  // Build environment-specific modules
  const data: Record<DambaEnvironmentType, any> = {} as Record<DambaEnvironmentType, any>;

  for (const env of envs) {
    data[env] = createModule();
  }

  const app = {
    name: 'Demo App',
    host: 'localhost',
    port: 8080,
    version: 1,
    created_by: owner,
    secretKey: undefined,
    type_app: 'api',
    language: 'typescript',
    runtime: 'node18',
    data,
  };

  return app;
    }
})

export default api.done();