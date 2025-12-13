/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../../entities/BaseEntity';
import { Application } from '@App/services/Application/entities/Application';
import { AppServices } from '@App/services/AppService/entities/AppServices';

/** Project: child records of an Organization */
@Entity('modules')
export class Modules extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  parentId?: string;

  @Column({ type: 'varchar', nullable: true })
  projectId?: string;

  @Column({ type: 'varchar', nullable: true })
  OrgId?: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => Application, (o) => o.modules, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application?: Application;

  @OneToMany(() => AppServices, (m) => m.module, { cascade: true, nullable: true })
  services?: AppServices[];
}
