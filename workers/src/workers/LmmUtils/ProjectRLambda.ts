import { RunnableLambda } from '@langchain/core/runnables';
import { ProjectMetadata, ProjectMetadataSchema } from './index';
import { extractText, safeJsonParse } from './util';



export const parseProjectMetadataRunnable = new RunnableLambda({
  func: async (input: unknown): Promise<ProjectMetadata> => {
    const text = extractText(input);
    const parsedJson = safeJsonParse(text);
    return ProjectMetadataSchema.parse(parsedJson);
  },
});