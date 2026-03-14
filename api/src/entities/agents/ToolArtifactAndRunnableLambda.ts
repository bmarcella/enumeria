/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseModel } from './BaseModel';

export enum ToolRuntime {
  Container = 'container',
  NodeVM = 'node_vm',
  Wasm = 'wasm',
}

export enum ToolSourceType {
  InlineCode = 'inline_code',
  ArtifactRef = 'artifact_ref',
}

export enum ToolArtifactStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Approved = 'approved',
  Rejected = 'rejected',
  Delisted = 'delisted',
}

export enum ToolVisibility {
  Private = 'private',
  Org = 'org',
  Public = 'public',
  Unlisted = 'unlisted',
}

@Entity({ name: 'tool_artifacts' })
@Index(['publisherOrgId', 'status'])
@Index(['publisherOrgId', 'name'])
@Index(['contentHash'])
@Unique('uq_tool_artifact_org_name_version', ['publisherOrgId', 'name', 'version'])
export class ToolArtifact extends BaseModel {
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 32 })
  version!: string;

  @Column({ type: 'enum', enum: ToolRuntime, default: ToolRuntime.NodeVM })
  runtime!: ToolRuntime;

  // NEW: where the implementation comes from
  @Column({ type: 'enum', enum: ToolSourceType, default: ToolSourceType.InlineCode })
  sourceType!: ToolSourceType;

  // NEW: inline implementation (used when sourceType=inline_code)
  @Column({ type: 'text', nullable: true })
  code!: string | null;

  // Artifact pointer (used when sourceType=artifact_ref)
  @Column({ type: 'varchar', length: 255, nullable: true })
  artifactRef!: string | null;

  // sha256 of normalized content (code or artifactRef + schemas + limits + perms + runtime/version)
  @Column({ type: 'varchar', length: 72, nullable: true }) // ex: "sha256:<64>"
  contentHash?: string;

  @Column({ type: 'uuid' })
  publisherOrgId!: string;

  @Column({ type: 'uuid' })
  publisherUserId!: string;

  // Contract
  @Column({ type: 'jsonb', nullable: true })
  inputSchema?: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  outputSchema?: Record<string, any> | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  permissionsRequested!: string[];

  // NEW: runtime limits (timeout, memory, etc.)
  @Column({ type: 'jsonb', nullable: true })
  limits!: { timeoutMs?: number; maxMemoryMb?: number } | null;

  // NEW: env vars (MVP; later move secrets to vault)
  @Column({ type: 'jsonb', nullable: true })
  env!: Array<{ key: string; value?: string; secret?: boolean }> | null;

  @Column({ type: 'jsonb', nullable: true })
  sandboxPolicy!: Record<string, any> | null;

  @Column({ type: 'enum', enum: ToolArtifactStatus, default: ToolArtifactStatus.Draft })
  status!: ToolArtifactStatus;

  @Column({ type: 'enum', enum: ToolVisibility, default: ToolVisibility.Private })
  visibility!: ToolVisibility;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  approvedByUserId!: string | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ type: 'uuid', nullable: true })
  correlationId!: string | null;
}


export enum RunnableLambdaRuntime {
  NodeVM = 'node_vm',
}

export enum RunnableLambdaKind {
  InlineTransform = 'inline_transform',
  InlinePredicate = 'inline_predicate',
  InlineMapper = 'inline_mapper',
  InlineReducer = 'inline_reducer',
}

export enum RunnableLambdaStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Approved = 'approved',
  Rejected = 'rejected',
  Delisted = 'delisted',
}

export enum RunnableLambdaVisibility {
  Private = 'private',
  Org = 'org',
  Public = 'public',
  Unlisted = 'unlisted',
}

@Entity({ name: 'runnable_lambdas' })
@Index(['publisherOrgId', 'status'])
@Index(['publisherOrgId', 'name'])
@Index(['contentHash'])
@Unique('uq_runnable_lambda_org_name_version', ['publisherOrgId', 'name', 'version'])
export class RunnableLambda extends BaseModel {
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 32 })
  version!: string;

  @Column({
    type: 'enum',
    enum: RunnableLambdaRuntime,
    default: RunnableLambdaRuntime.NodeVM,
  })
  runtime!: RunnableLambdaRuntime;

  @Column({
    type: 'enum',
    enum: RunnableLambdaKind,
    default: RunnableLambdaKind.InlineTransform,
  })
  kind!: RunnableLambdaKind;

  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'jsonb', nullable: true })
  inputSchema!: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  outputSchema!: Record<string, any> | null;

  @Column({ type: 'int', default: 1000 })
  timeoutMs!: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  permissionsRequested!: string[];

  @Column({ type: 'varchar', length: 72 })
  contentHash!: string;

  @Column({ type: 'uuid' })
  publisherOrgId!: string;

  @Column({ type: 'uuid' })
  publisherUserId!: string;

  @Column({
    type: 'enum',
    enum: RunnableLambdaStatus,
    default: RunnableLambdaStatus.Draft,
  })
  status!: RunnableLambdaStatus;

  @Column({
    type: 'enum',
    enum: RunnableLambdaVisibility,
    default: RunnableLambdaVisibility.Private,
  })
  visibility!: RunnableLambdaVisibility;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  approvedByUserId!: string | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason!: string | null;

  @Column({ type: 'uuid', nullable: true })
  correlationId!: string | null;
}
