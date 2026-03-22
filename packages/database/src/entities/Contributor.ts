import {
  Entity,
  Unique,
  BaseEntity,
  PrimaryGeneratedColumn,
  Index,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './Organization';

export enum OrgContributorRole {
  ADMIN = 'admin',
  MAINTAINER = 'maintainer',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

/** Contributor: high-level maintainer assignment */
@Entity('org_contributors')
@Unique('uniq_org_contributor', ['organizationId', 'userId'])
export class Contributor extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  organizationId!: string;

  @ManyToOne(() => Organization, (o) => o.contributors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  // If you have a User entity, replace with a relation
  @Index()
  @Column({ type: 'varchar', length: 64 })
  userId!: string;

  @Column({ type: 'enum', enum: OrgContributorRole, default: OrgContributorRole.MAINTAINER })
  role!: OrgContributorRole;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
