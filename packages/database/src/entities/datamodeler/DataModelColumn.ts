import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../BaseEntity';
import { DataModelEntity } from './DataModelEntity';

@Entity('data_model_columns')
export class DataModelColumn extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  entityId!: string;

  @ManyToOne(() => DataModelEntity, (entity) => entity.columns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entityId' })
  entity!: DataModelEntity;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 64 })
  dataType!: string;

  @Column({ type: 'boolean', default: false })
  isPrimaryKey!: boolean;

  @Column({ type: 'boolean', default: false })
  isForeignKey!: boolean;

  @Column({ type: 'boolean', default: false })
  isUnique!: boolean;

  @Column({ type: 'boolean', default: false })
  isNotNull!: boolean;

  @Column({ type: 'boolean', default: false })
  isArray!: boolean;

  @Column({ type: 'varchar', nullable: true })
  defaultValue!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  enumValues!: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  checkConstraint!: string | null;

  @Column({ type: 'int', nullable: true })
  length!: number | null;

  @Column({ type: 'int', nullable: true })
  precision!: number | null;

  @Column({ type: 'int', nullable: true })
  scale!: number | null;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'int', default: 0 })
  ordinal!: number;
}
