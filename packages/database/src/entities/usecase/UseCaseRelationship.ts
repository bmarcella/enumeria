import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AppBaseEntity } from '../BaseEntity';

@Entity('use_case_relationships')
export class UseCaseRelationship extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  fromId!: string;

  @Column({ type: 'varchar', length: 16 })
  fromType!: string; // 'actor' | 'usecase'

  @Column({ type: 'uuid' })
  toId!: string;

  @Column({ type: 'varchar', length: 16 })
  toType!: string; // 'actor' | 'usecase'

  @Column({ type: 'varchar', length: 32, default: 'association' })
  type!: string; // 'association' | 'include' | 'extend' | 'generalization'

  @Column({ type: 'varchar', length: 160, nullable: true })
  label!: string | null;

  @Column({ type: 'varchar' })
  orgId!: string;

  @Column({ type: 'varchar' })
  projId!: string;
}
