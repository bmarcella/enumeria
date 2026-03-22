import {
  AgentDefinition,
  AgentListing,
  Purchase,
  License,
  AgentAssignment,
  AgentRun,
  AgentProposal,
  AgentSnapshot,
} from './contracts/Agents';
import { AuditEvent } from './contracts/AuditEvent';
import { RunnableLambda, ToolArtifact } from './contracts/ToolArtifactAndRunnableLambda';

export const AgentMarketplaceEntities = [
  AgentSnapshot,
  AgentDefinition,
  AgentListing,
  Purchase,
  License,
  AgentAssignment,
  AgentRun,
  AgentProposal,
  AuditEvent,
  ToolArtifact,
  RunnableLambda,
];


