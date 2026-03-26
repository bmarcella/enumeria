import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, JoinColumn } from 'typeorm';
import { Middleware } from '../Middleware';
import { DambaFullMeta } from '../BaseEntity';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { Behavior } from '../Behaviors';
import { Application } from '../Application';

@Entity('policy')
export class Policy extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: DambaEnvironmentType, nullable: true })
  environment?: DambaEnvironmentType;

  @ManyToMany(() => Behavior, (b) => b.policies)
  behaviors?: Behavior[];

  @ManyToOne(() => Application, (a) => a.policies)
  @JoinColumn({ name: 'applicationId' })
  application?: Application;

  @ManyToMany(() => Middleware, (m) => m.policies)
  @JoinTable({
    name: 'policies_middlewares',
    joinColumn: { name: 'policy_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'middleware_id', referencedColumnName: 'id' },
  })
  middlewares?: Middleware[];
}
