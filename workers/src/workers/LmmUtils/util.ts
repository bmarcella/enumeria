import { AIMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";

export function extractText(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input instanceof AIMessage) {
    const content = input.content;
    if (typeof content === 'string') return content;

    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (part && typeof part === 'object' && 'text' in part) {
            return String(part.text);
          }
          return '';
        })
        .join('');
    }
  }
  if (
    input &&
    typeof input === 'object' &&
    'content' in input &&
    typeof (input as { content?: unknown }).content === 'string'
  ) {
    return (input as { content: string }).content;
  }
  throw new Error('Unable to extract text from LLM response');
}

export function safeJsonParse(text: string): unknown {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`LLM did not return valid JSON: ${text}`);
    }
    return JSON.parse(jsonMatch[0]);
  }
}

const escapeBraces = (str: string) =>
  str.replace(/{/g, "{{").replace(/}/g, "}}");

export const callLLM =  async <T>  (llm : any, prompt: any, input: any, runnableLambda: RunnableLambda<unknown, T>) => {
    const chain = prompt.pipe(llm).pipe(runnableLambda);
    const response = await chain.invoke(input);
    return response;
}