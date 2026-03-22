import { ChatPromptTemplate } from "@langchain/core/prompts";
import { systemPromptForProject } from "./ProjectsPromt";
import { z } from "zod";
import { parseProjectMetadataRunnable } from "./ProjectRLambda";
import { callLLM } from "./util";

export const ProjectMetadataSchema = z.object({
  name: z
    .string()
    .min(2, 'Project name must have at least 2 characters')
    .max(80, 'Project name is too long'),
  description: z
    .string()
    .min(10, 'Description must have at least 10 characters')
    .max(500, 'Description is too long'),
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;

export const callLLMForProject = async (llm : any, project: any) => {
    const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPromptForProject],
    ["user", "{project}"],  
    ]);
    const response =  await callLLM<ProjectMetadata>(llm, prompt, { project }, parseProjectMetadataRunnable);
    return response;
}