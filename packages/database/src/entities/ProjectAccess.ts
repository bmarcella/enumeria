import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, OneToMany } from 'typeorm';
import { AppBaseEntity } from './BaseEntity';
import { Project } from './Project';
import { ModuleAccessOverride } from './ModuleAccessOverride';

@Entity('project_access')
@Unique(['projectId', 'userId'])
export class ProjectAccess extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column({ type: 'varchar', length: 64 })
  userId!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  groupId!: string | null;

  @Column({ type: 'varchar', length: 16, default: 'read' })
  accessLevel!: string; // 'read' | 'write' | 'admin'

  @Column({ type: 'varchar', length: 64 })
  grantedBy!: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @OneToMany(() => ModuleAccessOverride, (o) => o.projectAccess, { cascade: true })
  overrides!: ModuleAccessOverride[];
}
