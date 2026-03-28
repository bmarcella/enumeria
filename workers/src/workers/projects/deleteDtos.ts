export interface DeleteJobData {
  projectId: string;
  requestId?: string;
  userId?: string;
  tenantId?: string;
}

export interface DeleteJobResult {
  projectId: string;
  deleted: boolean;
}
