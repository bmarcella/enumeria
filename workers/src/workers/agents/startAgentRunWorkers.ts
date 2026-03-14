
import { AgentRunJobPayload } from "@Damba/core/AgentDefType";
import { DQueues } from "@Damba/core/Queues";
import { startWorkers, DefaultlLLM } from "..";
import { agentRunProcessor, AgentRunJobResult } from "./agentRunProcessor";


startWorkers<AgentRunJobPayload, AgentRunJobResult, string, typeof DefaultlLLM>(
  DQueues.AGENT_RUN,
  DefaultlLLM,
  agentRunProcessor
);