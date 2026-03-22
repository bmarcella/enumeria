/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DEvent<REQ = any, RES = any, NEXT = any> {
    in: REQ;
    out: RES;
    go: NEXT;
}