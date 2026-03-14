export const Subjects = {
  runStarted: (tenantId: string) => `tenant.${tenantId}.agentRun.started`,
  runProgress: (tenantId: string) => `tenant.${tenantId}.agentRun.progress`,
  runCompleted: (tenantId: string) => `tenant.${tenantId}.agentRun.completed`,
  runFailed: (tenantId: string) => `tenant.${tenantId}.agentRun.failed`,
  runProgressById: (tenantId: string, runId: string) =>
    `tenant.${tenantId}.agentRun.${runId}.progress`,
};
