/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { Project } from '../Project';
import { Contributor, OrgContributorRole } from '../Contributor';
import { OrgDomain } from '../OrgDomain';
import { OrgMember, OrgMemberRole } from '../OrgMember';
import { User } from '../User';

export enum OrgVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum OrgStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum OrgPlan {
  FREE = 'free',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
}

export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential',
}

export enum SsoProvider {
  GOOGLE = 'google',
  AZUREAD = 'azuread',
  OKTA = 'okta',
  GITHUB = 'github',
  CUSTOM = 'custom',
}

export enum ProjectNamingConvention {
  SLUG = 'slug',
  KEY_NAME = 'key-name',
  NAME_ONLY = 'name-only',
}

export type Environments = Record<string, any>;
export type Config<T = any> = { version?: string; value?: T };
export type OrgCanvasSetting = Record<string, any>;

export class OrgIntegrations {
  githubOrg?: string;
  gitlabGroup?: string;
  linearTeamId?: string;
  jiraProjectKey?: string;
  slackWorkspace?: string;
}

export class OrgBilling {
  customerId?: string;
  currency?: string;
  cycle?: 'monthly' | 'yearly' | 'free';
  seats?: number;
}

@Entity('organizations')
export class Organization extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string | null;

  @Column({ type: 'enum', enum: OrgVisibility, default: OrgVisibility.PRIVATE })
  visibility!: OrgVisibility;

  @Column({ type: 'enum', enum: OrgStatus, default: OrgStatus.ACTIVE })
  status!: OrgStatus;

  @Column({ type: 'enum', enum: OrgPlan, default: OrgPlan.FREE })
  plan!: OrgPlan;

  @Column({ type: 'timestamptz', nullable: true })
  trialEndsAt?: Date | null;

  @ManyToOne(() => User, (user) => user.organizations)
  user!: User;

  @OneToMany(() => Contributor, (c) => c.organization, { cascade: true, nullable: true })
  contributors?: Contributor[];

  @OneToMany(() => OrgMember, (m) => m.organization, { cascade: true, nullable: true })
  members?: OrgMember[];

  @Column({ type: 'enum', enum: OrgContributorRole, default: OrgContributorRole.MAINTAINER, nullable: true })
  defaultOrgContributorRole?: OrgContributorRole | null;

  @Column({ type: 'enum', enum: OrgMemberRole, default: OrgMemberRole.MEMBER, nullable: true })
  defaultOrgMemberRole?: OrgMemberRole | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  rbacPolicyId?: string | null;

  @Column({ type: 'enum', enum: DataClassification, default: DataClassification.INTERNAL })
  dataClassification!: DataClassification;

  @OneToMany(() => OrgDomain, (d) => d.organization, { cascade: true, nullable: true })
  domains?: OrgDomain[];

  @Column({ type: 'enum', enum: SsoProvider, nullable: true })
  ssoProvider?: SsoProvider | null;

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean;

  @Column({ type: 'boolean', default: false })
  mfaRequired!: boolean;

  @Column({ type: 'varchar', length: 16, nullable: true })
  locale?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  region?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  environments?: Environments | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  defaultProjectTemplateId?: string | null;

  @Column({ type: 'enum', enum: ProjectNamingConvention, default: ProjectNamingConvention.SLUG })
  projectNamingConvention!: ProjectNamingConvention;

  @Column({ type: 'jsonb', nullable: true })
  integrations?: OrgIntegrations | null;

  @Column({ type: 'jsonb', nullable: true })
  billing?: OrgBilling | null;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]', nullable: true })
  tags!: string[];

  @OneToMany(() => Project, (p) => p.organization, { eager: true, cascade: true, nullable: true })
  @JoinTable()
  projects?: Project[];

  @Column({ type: 'jsonb', nullable: true })
  config?: Config<OrgCanvasSetting> | null;
}

@Index('idx_org_search', ['name'])
@Entity({ name: 'organizations' })
export class __OrgIndexAnchor {}
