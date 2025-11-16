// middlewares barrel

import { DEvent } from "@Damba/service/DambaService";

// middlewares barrel
export const DefaultMiddleware  =  async (e: DEvent) => {
    e.go();
}