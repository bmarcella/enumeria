import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../BaseEntity';
import { UseCase } from './UseCase';

@Entity('use_case_scenarios')
export class UseCaseScenario extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  useCaseId!: string;

  @ManyToOne(() => UseCase, (uc) => uc.scenarios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'useCaseId' })
  useCase!: UseCase;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'nominal' })
  type!: string; // 'nominal' | 'alternative' | 'exception'

  @Column({ type: 'int', default: 0 })
  ordinal!: number;
}
