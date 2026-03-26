import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Policy } from '../Policy';
import { DambaFullMeta } from '../BaseEntity';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { Application } from '../Application';

@Entity('middleware')
export class Middleware extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: DambaEnvironmentType, nullable: true })
  environment?: DambaEnvironmentType;

  @ManyToMany(() => Policy, (p) => p.middlewares)
  policies?: Policy[];

  @ManyToOne(() => Application, (a) => a.middlewares)
  @JoinColumn({ name: 'applicationId' })
  application?: Application;
}
