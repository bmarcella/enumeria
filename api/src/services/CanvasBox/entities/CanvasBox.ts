/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppBaseEntity } from "entities/BaseEntity";
import { Column, Entity , PrimaryGeneratedColumn } from "typeorm";
import { CanvasBoxAtributes, CanvasBoxClassification, CanvasBoxMapConfig, CanvasBoxStatus, EntityStereotype } from "../../../../../common/Entity/CanvasBox";

@Entity('entities')
export class Entities extends AppBaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id?: string;


  // REQUIRED FIELD
  @Column({ type: 'varchar',  nullable: false })
  entityName!: string;

  @Column({ type: 'enum', enum: EntityStereotype, nullable: false, default: EntityStereotype.ENTITY  })
  stereotype!: EntityStereotype;

  @Column({ type: 'varchar',  nullable: false })
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


  // META 
  @Column({ type: 'varchar', nullable: false })
  orgId?: string;

  @Column({ type: 'varchar', nullable: false })
  projId?: string;

  @Column({ type: 'varchar', nullable: false })
  appId?: string;

  @Column({ type: 'varchar', nullable: false })
  moduleId?: string;

  @Column({ type: 'varchar', nullable: false })
  servId?: string;
  // END META

    // fields
  @Column({ type: 'jsonb', nullable: true })
  attributes?: CanvasBoxAtributes [];

  @Column({ type: 'varchar', nullable: true })
  extendsId?: string;

  @Column({ type: 'varchar', nullable: true , default: 'active' })
  status?: CanvasBoxStatus;


  @Column({ type: 'jsonb', nullable: true })
  mapConfig?: CanvasBoxMapConfig[];

 @Column({ type: 'jsonb', nullable: true })
  diagramConfig?: CanvasBoxMapConfig[];

  


 @Column({ type: 'jsonb', nullable: true })
 rules?: Record<string, unknown>;

 @Column({ type: 'jsonb', nullable: true })
 mixins?: string[];

  
//   @Column({ type: 'jsonb', nullable: true })
//   tags?: string[]; ADD TABLE ENTITYTAGS

}