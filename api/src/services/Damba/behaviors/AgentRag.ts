import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { LoadFiles, IDambaFile } from "@Damba/v2/helper/readFile";
import { resolve } from "path";
import { DambaApi, DEventHandlerFactory } from "@Damba/v2/service/DambaService";
import { DEvent } from "@Damba/v2/service/DEvent";
import { createAgent } from "langchain";

export async function buildQdrantRetriever() {
  const files = (await LoadFiles(
    resolve(process.cwd(), '../common/Damba/v2'),
  )) as IDambaFile[];

  const docs = files.map(
    f => new Document({ pageContent: f.content, metadata: { path: f.basePath } })
  );

  const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

  // Build vector store in Qdrant
  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: "damba_codebase",
  });

  return vectorStore.asRetriever({ k: 5 });
}


let retrieverPromise: Promise<any> | null = null;

export const agentRagQdrantBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const question = api?.params().query;

    if (!question) {
      e.out.status(400).send({ error: 'Query parameter is required' });
      return;
    }

    // Build retriever once (lazy init)
    if (!retrieverPromise) {
      retrieverPromise = buildQdrantRetriever();
    }
    const retriever = await retrieverPromise;

    // Wrap retriever as a tool
    const retrieverTool = {
      name: 'codebase_search',
      description: 'Retrieve relevant Damba code/document text.',
      invoke: async ({ query }: { query: string }) => {
        const docs = await retriever.getRelevantDocuments(query);
        return docs.map((d: any) => ({
          content: d.pageContent,
          path: d.metadata?.path,
        }));
      },
    };

    const agent = createAgent({
      model: e.in.openAi,
      tools: [retrieverTool],
      systemPrompt: `
You are a knowledgeable assistant specialized in the Damba framework.
Use the codebase_search tool for retrieval when needed.
Answer ONLY based on the retrieved documentation/code fragments.
If there’s no relevant context, reply: "I don't know based on the available codebase."
`.trim(),
    });

    const result: any = await agent.invoke({
      messages: [{ role: 'user', content: question }],
    });

    // Final answer
    const lastMessage = result.messages?.at?.(-1);
    const content = lastMessage?.content ?? '';

    e.out.send({ question, answer: content });
  };
};

