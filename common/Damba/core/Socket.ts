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

export enum ServiceName {
  SOCKET = "socket",
}

export const SocketAction = {
  create: (entity: EntityType, service?: string) =>
    `${service ? `${service}:` : ""}create:${entity}`,
  update: (entity: EntityType, service?: string) =>
    `${service ? `${service}:` : ""}update:${entity}`,
  delete: (entity: EntityType, service?: string) =>
    `${service ? `${service}:` : ""}delete:${entity}`,
  /** Pipeline step action: `pipeline:{step_name}` */
  pipeline: (step: string) => `pipeline:${step}`,
};

export const SocketResponse = {
  create: (entity: EntityType, step: "progress" | "complete" | "error") =>
    `${step ? `${step}:` : ""}create:${entity}`,
  update: (entity: EntityType, step?: string) =>
    `${step ? `${step}:` : ""}update:${entity}`,
  delete: (entity: EntityType, step?: string) =>
    `${step ? `${step}:` : ""}delete:${entity}`,
};
