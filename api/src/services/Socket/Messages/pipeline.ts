/* eslint-disable @typescript-eslint/no-explicit-any */
import { pipelineQueue } from '@Damba/core/Queues';
import { PipelineStep } from '@Damba/core/CreateProjectStep';
import { EventBehavior, DambaApi } from '@Damba/v2/service/DambaService';
import { EventHandler } from '@Damba/v2/service/IServiceDamba';
import { User } from '@Database/entities/User';
import { Socket } from 'socket.io';

/**
 * Creates a socket event handler for a pipeline step.
 * The client sends: { payload: { projectId, prompt }, newRequestId }
 * Step 1 doesn't require projectId (it creates the project).
 */
const createStepEvent = (step: PipelineStep): EventBehavior => {
  return (api?: DambaApi): EventHandler => {
    return async (socket: Socket, data: any, _callback) => {
      const user = socket.data.user as User;
      const queueName = pipelineQueue(step);

      const payload = {
        step,
        projectId: data.payload?.projectId,
        userId: user.id,
        tenantId: user.currentSetting?.orgId,
        prompt: data.payload?.prompt ?? '',
        requestId: data.newRequestId,
        correlationId: data.payload?.correlationId,
        enqueuedAt: new Date().toISOString(),
      };

      const job: any = await api?.enqueue(queueName, payload);
      return { jobId: job?.id, step };
    };
  };
};

// Export one event per step
export const pipeline_step1_event = createStepEvent(PipelineStep.PROJECT_AND_APPS);
export const pipeline_step2_event = createStepEvent(PipelineStep.ENTITIES);
export const pipeline_step3_event = createStepEvent(PipelineStep.MODULES);
export const pipeline_step4_event = createStepEvent(PipelineStep.SERVICES);
export const pipeline_step5_event = createStepEvent(PipelineStep.VALIDATORS);
export const pipeline_step6_event = createStepEvent(PipelineStep.MIDDLEWARES_POLICIES);
export const pipeline_step7_event = createStepEvent(PipelineStep.BEHAVIORS_EXTRAS);
export const pipeline_step8_event = createStepEvent(PipelineStep.APP_FILES);
export const pipeline_step9_event = createStepEvent(PipelineStep.DAMBA_COMMON);
