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

export enum OrgMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  CONTRIBUTOR = 'contributor',
}

/** OrgMember: full membership roster */
@Entity('org_members')
@Unique('uniq_org_member', ['organizationId', 'userId'])
export class OrgMember extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column('uuid')
  organizationId!: string;

  @ManyToOne(() => Organization, (o) => o.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;

  // If you have a User entity, replace with a relation
  @Index()
  @Column({ type: 'varchar', length: 64 })
  userId!: string;

  @Column({ type: 'enum', enum: OrgMemberRole, default: OrgMemberRole.MEMBER })
  role!: OrgMemberRole;

  @Column({ type: 'timestamptz', nullable: true })
  invitedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  joinedAt?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
