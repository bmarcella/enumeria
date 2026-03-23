import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { DambaMeta } from '../BaseEntity';

@Entity('use_case_actors')
export class UseCaseActor extends DambaMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'varchar', length: 32, default: 'human' })
  type!: string; // 'human' | 'system' | 'external'

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'float', nullable: true, default: 0 })
  positionX!: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  positionY!: number;

  @Column({ type: 'varchar', nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;
}
