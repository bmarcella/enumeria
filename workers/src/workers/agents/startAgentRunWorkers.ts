
import { AgentRunJobPayload } from "@Damba/core/AgentDefType";
import { DQueues } from "@Damba/core/Queues";
import { startWorkers, DefaultLLM } from "..";
import { agentRunProcessor, AgentRunJobResult } from "./agentRunProcessor";


(async () => {
  await startWorkers<AgentRunJobPayload, AgentRunJobResult, string, typeof DefaultLLM>(
    DQueues.AGENT_RUN,
    DefaultLLM,
    agentRunProcessor
  );
})();