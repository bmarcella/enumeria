import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../BaseEntity';
import { DataModelEntity } from './DataModelEntity';
import { DataModelColumn } from './DataModelColumn';

@Entity('data_model_relationships')
export class DataModelRelationship extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  fromEntityId!: string;

  @Column({ type: 'uuid' })
  toEntityId!: string;

  @ManyToOne(() => DataModelEntity, (e) => e.outgoingRelationships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromEntityId' })
  fromEntity!: DataModelEntity;

  @ManyToOne(() => DataModelEntity, (e) => e.incomingRelationships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toEntityId' })
  toEntity!: DataModelEntity;

  @Column({ type: 'varchar', length: 8 })
  type!: string; // '1:1' | '1:N' | 'N:1' | 'N:N'

  @Column({ type: 'varchar', length: 160, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', nullable: true })
  color!: string | null;

  @Column({ type: 'uuid', nullable: true })
  fkColumnId!: string | null;

  @ManyToOne(() => DataModelColumn, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fkColumnId' })
  fkColumn!: DataModelColumn | null;

  @Column({ type: 'varchar', length: 16, default: 'RESTRICT' })
  onDelete!: string;

  @Column({ type: 'varchar', length: 16, default: 'RESTRICT' })
  onUpdate!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar' })
  orgId!: string;

  @Column({ type: 'varchar' })
  projId!: string;
}
