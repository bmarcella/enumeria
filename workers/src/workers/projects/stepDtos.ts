import { PipelineStep } from '../../../../common/Damba/core/CreateProjectStep';

/**
 * Base payload for all pipeline step jobs.
 * The client sends this after validating the previous step's output.
 */
export interface StepJobData {
  /** The pipeline step to execute */
  step: PipelineStep;
  /** Project ID (set after step 1 creates the project) */
  projectId: string;
  /** User ID */
  userId: string;
  /** Tenant/org ID */
  tenantId: string;
  /** Socket request ID for progress events */
  requestId?: string;
  /** The original user prompt (needed for LLM context in every step) */
  prompt: string;
}

/** Step 1 input — only needs the prompt (no projectId yet) */
export interface Step1JobData extends Omit<StepJobData, 'projectId'> {
  step: PipelineStep.PROJECT_AND_APPS;
  projectId?: undefined;
}

/** Generic result returned by each step */
export interface StepJobResult {
  step: PipelineStep;
  projectId: string;
  /** Socket request ID for routing events back to the client */
  requestId?: string;
  /** The next step the user should trigger, or undefined if done */
  nextStep?: PipelineStep;
  /** Step-specific data for the UI to display for validation */
  data: any;
}
