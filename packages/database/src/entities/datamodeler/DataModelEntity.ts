import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DambaFullMeta } from '../BaseEntity';
import { DataModelColumn } from './DataModelColumn';
import { DataModelRelationship } from './DataModelRelationship';

@Entity('data_model_entities')
export class DataModelEntity extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'float', nullable: true, default: 0 })
  positionX!: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  positionY!: number;

  @Column({ type: 'float', nullable: true, default: 200 })
  width!: number;

  @Column({ type: 'float', nullable: true, default: 100 })
  height!: number;

  @Column({ type: 'varchar', nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', nullable: true })
  tableName!: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @OneToMany(() => DataModelColumn, (col) => col.entity, { cascade: true, eager: true })
  columns!: DataModelColumn[];

  @OneToMany(() => DataModelRelationship, (rel) => rel.fromEntity)
  outgoingRelationships!: DataModelRelationship[];

  @OneToMany(() => DataModelRelationship, (rel) => rel.toEntity)
  incomingRelationships!: DataModelRelationship[];
}
