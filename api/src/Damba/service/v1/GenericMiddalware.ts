/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorMessage } from "../../../../../common/error/error";
import { DEvent, ServiceConfig } from "./DambaService";

interface PropsDefaultDMiddlewares {
     DCheckIfExist :  (e: DEvent) => any ;
}

export const defaultDMiddlewares  = (service_name: string, config: ServiceConfig,  entity?: new (...args: any[]) => any,  ) : PropsDefaultDMiddlewares  => {
  
  return  {
    DCheckIfExist :  async (e: DEvent) => {
            const name_id = config?.id_name ?? 'id';
            let id = e.in.params[name_id];
            if (!id) id = e.in.body['id'];
            if (!id) throw new Error(`${name_id} not found in params or boby`);
            if (!entity) throw new Error('Entity class not provided to createBehaviors');
            const object =   await e.in.DRepository.DGet(entity, {  
            where : {
                [config?.id_name ?? 'id']: id
            }
            }) as any; 
            if(!object) e.out.sendStatus(404).send({error: ErrorMessage.NOT_FOUND})
            // set Data 
            e.in.data = {
                  ...e.in.data,
                  [service_name] : object
            };
            e.go();
    }
  }
}