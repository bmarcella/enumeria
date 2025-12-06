/* eslint-disable @typescript-eslint/no-explicit-any */

import { ErrorMessage } from "../../../error/error";
import { ServiceConfig } from "./ServiceConfig";

interface PropsDefaultDMiddlewares {
  DCheckIfExist: (e: any) => Promise<void> | void;
}

export const defaultDMiddlewares = <REQ, RES, NEXT>(
  service_name: string,
  config: ServiceConfig<REQ, RES, NEXT>,
  entity?: new (...args: any[]) => any
): PropsDefaultDMiddlewares => {
  return {
    DCheckIfExist: async (e: any) => {
      const name_id = config?.id_name ?? "id";
      let id = e.in.params[name_id];
      if (!id) id = e.in.body?.[name_id];

      if (!id) throw new Error(`${name_id} not found in params or body`);
      if (!entity) throw new Error("Entity class not provided to createBehaviors");

      const object = (await e.in.DRepository.DGet(entity, {
        where: { [name_id]: id },
      })) as any;

      if (!object) {
        // Express: sendStatus ends the response; you can't chain .send() after it.
        e.out.status(404).send({ error: ErrorMessage.NOT_FOUND });
        return;
      }
      // set Data
      e.in.data = {
        ...(e.in.data ?? {}),
        [service_name]: object,
      };
      e.go();
    },
  };
};
