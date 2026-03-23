import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from './BaseEntity';
import { ProjectAccess } from './ProjectAccess';

@Entity('module_access_overrides')
export class ModuleAccessOverride extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  projectAccessId!: string;

  @ManyToOne(() => ProjectAccess, (pa) => pa.overrides, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectAccessId' })
  projectAccess!: ProjectAccess;

  @Column({ type: 'varchar', length: 16 })
  moduleType!: string; // 'data' | 'usecase' | 'c4' | 'code'

  @Column({ type: 'varchar', length: 16, default: 'read' })
  accessLevel!: string; // 'none' | 'read' | 'write' | 'admin'
}
