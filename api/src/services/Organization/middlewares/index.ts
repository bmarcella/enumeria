import { DEvent } from "@Damba/service/v1/DambaService";

// middlewares barrel
export const DefaultMiddleware  =  async (e: DEvent) => {
    e.go();
}