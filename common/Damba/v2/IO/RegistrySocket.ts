// core/SocketRegistry.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type SocketLike = {
  emit: (event: string, payload: any, _callback?: any, io?: any) => void;
} |  any;

type Store = {
  io?: any;
  // requestId -> sockets
  byRequest: Map<string, Set<SocketLike>>;
  // userId -> sockets
  byUser: Map<string, Set<SocketLike>>;
  // all sockets (optional)
  sockets: Set<SocketLike>;
};

const store: Store = {
  byRequest: new Map(),
  byUser: new Map(),
  sockets: new Set(),
};

function getOrCreateSet(map: Map<string, Set<SocketLike>>, key: string) {
  let set = map.get(key);
  if (!set) {
    set = new Set<SocketLike>();
    map.set(key, set);
  }
  return set;
}

function removeFromAllMaps(socket: SocketLike) {
  // Remove from request map
  for (const [key, set] of store.byRequest.entries()) {
    if (set.delete(socket) && set.size === 0) store.byRequest.delete(key);
  }
  // Remove from user map
  for (const [key, set] of store.byUser.entries()) {
    if (set.delete(socket) && set.size === 0) store.byUser.delete(key);
  }
}

export const SocketRegistry = {
  init(patch: { io?: any }) {
    if (patch.io) store.io = patch.io;
  },

  get io() {
    return store.io;
  },

  // Debug helpers
  stats() {
    return {
      sockets: store.sockets.size,
      requestKeys: store.byRequest.size,
      userKeys: store.byUser.size,
    };
  },

  addSocket(socket: SocketLike) {
    store.sockets.add(socket);
  },

  removeSocket(socket: SocketLike) {
    store.sockets.delete(socket);
    removeFromAllMaps(socket);
  },

  bindRequest(socket: SocketLike, requestId: string) {
    if (!requestId) return;
    getOrCreateSet(store.byRequest, requestId).add(socket);
  },

  unbindRequest(socket: SocketLike, requestId: string) {
    const set = store.byRequest.get(requestId);
    if (!set) return;
    set.delete(socket);
    if (set.size === 0) store.byRequest.delete(requestId);
  },

  bindUser(socket: SocketLike, userId: string) {
    if (!userId) return;
    getOrCreateSet(store.byUser, userId).add(socket);
  },

  unbindUser(socket: SocketLike, userId: string) {
    const set = store.byUser.get(userId);
    if (!set) return;
    set.delete(socket);
    if (set.size === 0) store.byUser.delete(userId);
  },

  socketsForRequest(requestId: string) {
    return store.byRequest.get(requestId);
  },

  socketsForUser(userId: string) {
    return store.byUser.get(userId);
  },
};

export function emitAll(event: string, payload: any) {
  const io = SocketRegistry.io;
  if (io) io.emit(event, payload);
}

export function emitToRequest<T = any>(
  requestId: string,
  event: string,
  payload: T
) {
  const set = SocketRegistry.socketsForRequest(requestId); 
  if (!set || set.size === 0) return;

  for (const socket of set) {
    try {
      socket.emit(event, payload);
    } catch {
      // ignore per socket
    }
  }
}

export function emitToUser<T = any>(userId: string, event: string, payload: T) {
  const set = SocketRegistry.socketsForUser(userId);
  if (!set || set.size === 0) return;
  for (const socket of set) {
    try {
      socket.emit(event, payload);
    } catch {
      // ignore per socket
    }
  }
}
