// core/RegistrySocket.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RegistryContext } from "../Registry/RegistryContext";

export function emitAll(event: string, payload: any) {
  const io = RegistryContext.get().io;
  if (io) io.emit(event, payload);
}

export function emitToRequest<T = any>(requestId: string, event: string, payload: T) {
  const clients = RegistryContext.get().clients;
  const set = clients?.get(requestId);
  if (!set || set.size === 0) return;

  for (const socket of set) {
    try {
      socket.emit(event, payload);
    } catch {
      // ignore per socket
    }
  }
}