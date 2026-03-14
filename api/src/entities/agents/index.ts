import {
  AgentDefinition,
  AgentListing,
  Purchase,
  License,
  AgentAssignment,
  AgentRun,
  AgentProposal,
  AgentSnapshot,
} from './Agents';
import { AuditEvent } from './AuditEvent';
import { RunnableLambda, ToolArtifact } from './ToolArtifactAndRunnableLambda';

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
