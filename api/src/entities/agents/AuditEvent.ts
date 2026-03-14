import { Entity, Column, CreateDateColumn, Index } from "typeorm";
import { BaseModel } from "./BaseModel";

// AuditEvent.ts (reference)
export enum AuditEventType {
  AGENT_CREATED = "AGENT_CREATED",
  AGENT_UPDATED = "AGENT_UPDATED",
  AGENT_APPROVED = "AGENT_APPROVED",
  AGENT_SUBMITTED = "AGENT_SUBMITTED",
  AGENT_REJECTED = "AGENT_REJECTED",
  AGENT_DELISTED = "AGENT_DELISTED",
  AGENT_RUN_SUCCEEDED = "AGENT_RUN_SUCCEEDED",
  LISTING_PUBLISHED = "LISTING_PUBLISHED",
  LICENSE_ISSUED = "LICENSE_ISSUED",
  ASSIGNMENT_CREATED = "ASSIGNMENT_CREATED",
  AGENT_RUN_STARTED = "AGENT_RUN_STARTED",
  AGENT_RUN_FAILED = "AGENT_RUN_FAILED",
  PROPOSAL_ACCEPTED = "PROPOSAL_ACCEPTED",
  PROPOSAL_REJECTED = "PROPOSAL_REJECTED",
}


@Entity({ name: "audit_events" })
@Index(["resourceType", "created_at", "orgId",])
export class AuditEvent extends BaseModel {

  @Column({ type: "varchar" })
  type!: AuditEventType;

  @Column({ type: "uuid", nullable: true })
  orgId!: string;

  @Column({ type: "uuid", nullable: true })
  actorUserId?: string;

  @Column({ type: "varchar", nullable: true })
  resourceType?: string;

  @Column({ type: "uuid", nullable: true })
  resourceId?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: any;
}
