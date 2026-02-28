/* eslint-disable @typescript-eslint/no-explicit-any */

import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { LoadFiles, IDambaFile } from '@Damba/v2/helper/readFile';
import { resolve } from 'path';
import { Behavior, DambaApi } from '@Damba/v2/service/DambaService';
import { DEvent } from '@Damba/v2/service/DEvent';

let retrieverPromise: Promise<any> | null = null;

/**
 * Convert unknown file contents to a clean, non-empty string.
 * - supports string
 * - supports Buffer / Uint8Array (anything with byteLength)
 * - supports objects (JSON stringify fallback)
 */
function toCleanString(input: unknown): string | null {
  if (typeof input === 'string') {
    const s = input.trim();
    return s.length ? s : null;
  }

  // Buffer / Uint8Array / ArrayBuffer-like
  if (input && typeof input === 'object' && (input as any).byteLength != null) {
    try {
      const s = Buffer.from(input as any)
        .toString('utf8')
        .trim();
      return s.length ? s : null;
    } catch {
      return null;
    }
  }

  // Fallback for plain objects
  if (input && typeof input === 'object') {
    try {
      const s = JSON.stringify(input).trim();
      return s.length ? s : null;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Version-proof doc retrieval.
 * Newer LangChain retrievers are often Runnables => use invoke(query)
 * Older retrievers => getRelevantDocuments(query)
 */
async function retrieveDocs(retriever: any, query: string): Promise<Document[]> {
  if (retriever && typeof retriever.invoke === 'function') {
    return (await retriever.invoke(query)) as Document[];
  }
  if (retriever && typeof retriever.getRelevantDocuments === 'function') {
    return (await retriever.getRelevantDocuments(query)) as Document[];
  }
  throw new Error(
    'Retriever does not support invoke() or getRelevantDocuments(). Check LangChain versions.',
  );
}

/**
 * Keep prompt context bounded to avoid token blowups.
 */
function formatContext(docs: Document[], maxChars = 40_000): string {
  let out = '';
  for (const d of docs) {
    const path = (d.metadata as any)?.path ?? 'unknown';
    const chunkIndex = (d.metadata as any)?.chunkIndex ?? 'n/a';
    const content = String(d.pageContent ?? '');

    const block = `\n---\nPATH: ${path}\nCHUNK: ${chunkIndex}\nCONTENT:\n${content}\n`;
    if (out.length + block.length > maxChars) break;
    out += block;
  }
  return out.trim();
}

/**
 * Builds the Qdrant retriever from ALL files and chunks ("pages") before embedding.
 */
export async function buildQdrantRetriever() {
  const files = (await LoadFiles(resolve(process.cwd(), '../common/Damba/v2'))) as IDambaFile[];

  // 1) Base docs (one per file)
  const baseDocs: Document[] = files
    .map((f) => {
      const content = toCleanString((f as any).content);
      if (!content) return null;

      return new Document({
        pageContent: content,
        metadata: {
          path: (f as any).path,
        },
      });
    })
    .filter((d): d is any => d !== null);

  if (!baseDocs.length) {
    throw new Error('No valid documents to embed (all file contents were empty/invalid).');
  }

  // 2) Chunk into "pages"
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1400,
    chunkOverlap: 200,
  });

  const chunkedDocs = await splitter.splitDocuments(baseDocs);
  chunkedDocs.forEach((d, i) => {
    (d.metadata as any).chunkIndex = i;
  });

  // 3) Embeddings
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });

  // 4) Vector store in Qdrant
  const vectorStore = await QdrantVectorStore.fromDocuments(chunkedDocs, embeddings, {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    collectionName: 'damba_codebase',
  });

  // 5) Retriever (MMR for broad coverage)
  const retriever = vectorStore.asRetriever({
    searchType: 'mmr',
    k: 30,
    searchKwargs: {
      fetchK: 120,
      lambda: 0.5,
    },
  });

  return retriever;
}

/**
 * Strict RAG behavior:
 * - Always retrieves from the full indexed codebase (chunked)
 * - LLM answers ONLY using retrieved context
 * - If retrieval doesn't contain enough, returns exact fallback
 */
export const agentRagQdrantBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const question = api?.body().prompt;

    if (!question || typeof question !== 'string' || !question.trim()) {
      e.out.status(400).send({ error: 'prompt is required' });
      return;
    }

    // Lazy init (builds index once per process)
    if (!retrieverPromise) {
      retrieverPromise = buildQdrantRetriever();
    }

    const retriever = await retrieverPromise;

    // ✅ Always retrieve (version-proof)
    const retrievedDocs: Document[] = await retrieveDocs(retriever, question);
    console.log('Retrieved', retrievedDocs.length, 'chunks for question:', question);

    if (!retrievedDocs.length) {
      e.out.send("I don't know based on the available codebase.");
      return;
    }

    // Build bounded context
    const context = formatContext(retrievedDocs, 40_000);

    // LLM wrapper from your event
    const llm = e.in.openAi;

    // ✅ One constrained generation call
    const result: any = await llm.invoke([
      {
        role: 'system',
        content: [
          'You are a knowledgeable assistant specialized in the Damba framework.',
          'You MUST answer ONLY using the provided CONTEXT (code/doc fragments).',
          'If the context does not contain the answer, respond exactly: "I don\'t know based on the available codebase."',
          'Do not use outside knowledge. Do not guess.',
          "If you think it's necessary, include a short SOURCES list of the file and code source content values you used.",
        ].join('\n'),
      },
      {
        role: 'user',
        content: `QUESTION:\n${question}\n \nCONTEXT:\n${context}`,
      },
    ]);

    // Normalize output shapes across wrappers
    const content =
      result?.content ?? result?.message?.content ?? result?.messages?.at?.(-1)?.content ?? '';
    console.log('LLM response content:', result);
    e.out.send({ content });
  };
};
