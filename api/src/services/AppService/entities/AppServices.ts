

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { AppBaseEntity } from "../../../entities/BaseEntity"
import { Modules } from "@App/services/Modules/entities/Modules";

/** Project: child records of an Organization */
@Entity('app_services')
export class AppServices extends AppBaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  parentId?: string;

  //

  @Column({ type: 'varchar', nullable: false })
  applicationId?: string;

  @Column({ type: 'varchar', nullable: false })
  projectId?: string;

  @Column({ type: 'varchar', nullable: false })
  orgId?: string;

  @Column({ type: 'varchar', nullable: true })
  defaultEntity?: string;

  @Column({ type: 'jsonb', nullable: true })
  crudConfig?: any;

  //
  @Column({ type: 'text', nullable: true })
  description?: string | null

  @ManyToOne(() => Modules, (o) => o.services, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'moduleId' })
  module?: Modules;

}