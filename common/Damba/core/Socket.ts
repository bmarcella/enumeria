export enum EntityType {
  PROJECT = "project",
  APPLICATION = "application",
  MODULE = "module",
  SERVICE = "service",
  BEHAVIOR = "behavior",
  EXTRA = "extra",
  POLICY = "policy",
  AGENT_RUN = "agent_run",
}

export const SocketAction = {
  create: (entity: EntityType) => `socket:create:${entity}`,
  update: (entity: EntityType) => `socket:update:${entity}`,
  delete: (entity: EntityType) => `socket:delete:${entity}`,
};

// how to use it on client
// socket.emit(SocketAction.create(EntityType.PROJECT));
// socket.emit(SocketAction.update(EntityType.MODULE));