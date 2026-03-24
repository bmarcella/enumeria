import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, JoinColumn, ManyToOne } from 'typeorm';
import { Policy } from './Policy';
import { DambaFullMeta } from './BaseEntity';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { Application } from './Application';

/**
 * Relationship summary:
 *   Policy  >-<  Middleware  (Policy owns join table)
 *   Application >-< Middleware  (Application owns join table)
 *
 * Middleware does NOT directly own any join table — it only holds inverse refs.
 */
@Entity('middleware')
export class Middleware extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: DambaEnvironmentType,
    nullable: true,
  })
  environment?: DambaEnvironmentType;

  // ── Policy ↔ Middleware (inverse — Policy owns the join table) ───────────
  @ManyToMany(() => Policy, (p) => p.middlewares)
  policies?: Policy[];

  // ── Application ↔ Middleware (inverse — Application owns the join table) ─
  @ManyToOne(() => Application, (a) => a.middlewares)
  @JoinColumn({ name: 'applicationId' })
  application?: Application;  
}
