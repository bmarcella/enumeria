/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Organization } from '../../Organization/entities/Organization';
import { AppBaseEntity } from '../../../entities/BaseEntity';
import { Application } from '../../Application/entities/Application';
import { DambaEnvironmentType } from '../../../../../common/Entity/env';

/** Project: child records of an Organization */
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

  @Column({ type: 'int', nullable: false, default: 1 })
  version: number | undefined;

  @Column({ type: 'int', nullable: false, default: 1 })
  price: number | undefined;

  @Column({ type: 'boolean', nullable: false, default: false })
  isForSale: boolean | undefined;

  @OneToMany(() => Application, (m) => m.project, { cascade: true, nullable: true })
  applications!: Application[];

  @Column({
    type: 'enum',
    enum: DambaEnvironmentType,
    array: true,
    nullable: false,
  })
  environments?: DambaEnvironmentType[];
}
