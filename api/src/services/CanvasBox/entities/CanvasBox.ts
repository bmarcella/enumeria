/* eslint-disable @typescript-eslint/no-explicit-any */
import { DambaFullMeta } from "@App/entities/BaseEntity";
import { CanvasBoxAtributes, CanvasBoxClassification, CanvasBoxDiagramConfig, CanvasBoxMapConfig, CanvasBoxStatus, EntityStereotype } from "@Common/Entity/CanvasBox";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity('entities')
export class Entities extends DambaFullMeta {

  @PrimaryGeneratedColumn('uuid')
  id?: string;


  // REQUIRED FIELD
  @Column({ type: 'varchar', nullable: false })
  entityName!: string;

  @Column({ type: 'enum', enum: EntityStereotype, nullable: false, default: EntityStereotype.ENTITY })
  stereotype!: EntityStereotype;

  @Column({ type: 'varchar', nullable: false })
  env?: string;

  @Column({
    type: 'enum',
    enum: CanvasBoxClassification,
    nullable: false,
    default: CanvasBoxClassification.PUBLIC,
  })
  classification?: CanvasBoxClassification;

  @Column({ type: 'varchar', nullable: true })
  parentId?: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;


  // fields
  @Column({ type: 'jsonb', nullable: true })
  attributes?: CanvasBoxAtributes[];

  @Column({ type: 'varchar', nullable: true })
  extendsId?: string;

  @Column({ type: 'varchar', nullable: true, default: 'active' })
  status?: CanvasBoxStatus;


  @Column({ type: 'jsonb', nullable: true })
  mapConfig?: CanvasBoxMapConfig[];

  @Column({ type: 'jsonb', nullable: true })
  diagramConfig?: CanvasBoxDiagramConfig[];

  @Column({ type: 'jsonb', nullable: true })
  rules?: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  mixins?: string[];


}