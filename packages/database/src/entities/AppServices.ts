/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from './BaseEntity';
import { Modules } from './Modules';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { Extra } from './Extra';

/** Project: child records of an Organization */
@Entity('app_services')
export class AppServices extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  defaultEntity?: string;

  //
  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  crudConfig?: any;

  @Column({ type: 'varchar', nullable: true })
  parentId?: string;

  @Column({ type: 'varchar', nullable: false })
  applicationId?: string;

  @Column({ type: 'varchar', nullable: false })
  projectId?: string;

  @Column({ type: 'varchar', nullable: false })
  orgId?: string;

  @Column({
    type: 'enum',
    enum: DambaEnvironmentType,
    nullable: true,
  })
  environment?: DambaEnvironmentType;

  @ManyToOne(() => Modules, (o) => o.services, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moduleId' })
  module?: Modules;

  @OneToMany(() => Extra, (o) => o.appService, { cascade: true })
  @JoinColumn({ name: 'serviceId' })
  extras?: Extra[];

}
