import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AppBaseEntity } from '../BaseEntity';
import { Application } from '../Application';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';

export enum AppFileType {
  SOURCE   = 'source',
  CONFIG   = 'config',
  MANIFEST = 'manifest',
  LOCK     = 'lock',
  ENV      = 'env',
  DOCKER   = 'docker',
  DOC      = 'doc',
  OTHER    = 'other',
}

@Entity('app_files')
export class AppFile extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  /** Filename, e.g. "index.ts", "tsconfig.json", "package.json" */
  @Column({ type: 'varchar', nullable: false })
  name!: string;

  /** Directory path inside the project root, e.g. "/" or "/src" */
  @Column({ type: 'varchar', nullable: false, default: '/' })
  path!: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'enum', enum: AppFileType, nullable: false, default: AppFileType.SOURCE })
  fileType!: AppFileType;

  @ManyToOne(() => Application, (app) => app.files, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application!: Application;

  @Column({ type: 'varchar', nullable: true })
  projId?: string;

  @Column({ type: 'varchar', nullable: true })
  orgId?: string;

  @Column({ type: 'enum', enum: DambaEnvironmentType, nullable: true })
  environment?: DambaEnvironmentType;
}
