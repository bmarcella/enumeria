export type AckResponse = {
  ok?: boolean;
  event?: string;
  tenant_id?: string;
  correlationId?: string;
  requestId?: string;
  userId?: string;
  error?: string;
  data?: any;
  payload?: any;
};
