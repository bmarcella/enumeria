import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DambaFullMeta } from '../BaseEntity';
import { Application } from '../Application';

@Entity('validators')
export class Validators extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: false })
  description!: string;

  @Column({ type: 'jsonb', nullable: false })
  schema!: Record<string, unknown>;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'appId' })
  application?: Application;
}
