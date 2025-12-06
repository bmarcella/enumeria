import { DEvent } from "@App/damba.import";
// middlewares barrel
export const DefaultMiddleware = async (e: DEvent) => {
    e.go();
}