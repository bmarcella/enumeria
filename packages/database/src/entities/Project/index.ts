/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../Organization';
import { AppBaseEntity } from '../BaseEntity';
import { Application } from '../Application';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { ChatAi } from '../ChatAi';

export enum BuildStatus {
  INITIALIZING = 'initializing',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('projects')
export class Project extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization, (o) => o.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: BuildStatus, nullable: false, default: BuildStatus.INITIALIZING })
  buildStatus!: BuildStatus;

  @Column({ type: 'text', nullable: true })
  initialPrompt!: string;

  @OneToMany(() => ChatAi, (chatAi) => chatAi.project, { cascade: true, nullable: true })
  chatAis!: ChatAi[];

  @Column({ type: 'int', nullable: false, default: 1 })
  version: number | undefined;

  @Column({ type: 'int', nullable: false, default: 0 })
  price: number | undefined;

  @Column({ type: 'boolean', nullable: false, default: false })
  isForSale: boolean | undefined;

  @OneToMany(() => Application, (m) => m.project, { cascade: true, nullable: true })
  applications!: Application[];

  @Column({ type: 'enum', enum: DambaEnvironmentType, array: true, nullable: false })
  environments?: DambaEnvironmentType[];

  @Column({ type: 'varchar', nullable: true })
  currentPlan?: string;
}
