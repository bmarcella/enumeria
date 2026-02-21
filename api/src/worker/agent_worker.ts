
import connection from "@App/config/redis";
import { Worker } from "bullmq";

async function* fakeStream(text: string) {
  for (const w of (`Réponse: ${text}`).split(" ")) {
    await new Promise((r) => setTimeout(r, 40));
    yield w + " ";
  }
}

export function startAgentWorker() {
  return new Worker(
    "agent",
    async (job) => {
      const { conversationId, text } = job.data as { conversationId: string; text: string };

      await job.updateProgress({ conversationId, stage: "start" });

      let answer = "";
      await job.updateProgress({ conversationId, stage: "llm_start" });

      for await (const token of fakeStream(text)) {
        answer += token;

        // ⚠️ Émettre un token via progress (ça passe par QueueEvents → socket)
        await job.updateProgress({ conversationId, stage: "stream", token });
      }

      await job.updateProgress({ conversationId, stage: "final" });

      // IMPORTANT: inclure conversationId ici pour completed event
      return { conversationId, answer };
    },
    { connection, concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5) }
  );
}
