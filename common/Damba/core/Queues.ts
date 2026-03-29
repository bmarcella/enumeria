import { PipelineStep } from "./CreateProjectStep";

export enum DQueues {
  TOOlS_RUN = "tools_run",
  CREATE_PROJECT = "create_project",
  UPDATE_PROJECT = "update_project",
  DELETE_PROJECT = "delete_project",
  CREATE_ENTITIES = "create_entities",
  UPDATE_ENTITIES = "update_entities",
  AGENT_RUN = "agent_run",
}

/** Returns the queue name for a given pipeline step */
export const pipelineQueue = (step: PipelineStep): string =>
  `create_project-${step}`;
