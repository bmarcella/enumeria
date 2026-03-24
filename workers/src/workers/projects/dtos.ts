import { IWorkerPromptMeta } from '../../../../common/Damba/v2/Entity/IWorker';

export interface JobData extends IWorkerPromptMeta {
    userId: string;
    tenantId: string;
}
// JobResult is `any` because the project processor returns a Project entity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JobResult = any;

