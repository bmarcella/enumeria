import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DambaMeta } from '../BaseEntity';
import { UseCaseScenario } from './UseCaseScenario';

@Entity('use_cases')
export class UseCase extends DambaMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role!: string | null;

  @Column({ type: 'text', nullable: true })
  action!: string | null;

  @Column({ type: 'text', nullable: true })
  benefit!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'float', nullable: true, default: 0 })
  positionX!: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  positionY!: number;

  @Column({ type: 'varchar', nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', length: 16, default: 'medium' })
  priority!: string; // 'low' | 'medium' | 'high' | 'critical'

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @OneToMany(() => UseCaseScenario, (s) => s.useCase, { cascade: true, eager: true })
  scenarios!: UseCaseScenario[];
}
