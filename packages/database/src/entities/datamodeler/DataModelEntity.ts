import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { DambaMeta } from "../BaseEntity";
import { DataModelColumn } from "./DataModelColumn";
import { DataModelRelationship } from "./DataModelRelationship";
import { DambaEnvironmentType } from "@Damba/v2/Entity/env";
import { Application } from "../Application";

@Entity("data_model_entities")
export class DataModelEntity extends DambaMeta {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "boolean", default: false })
  isAbstract!: boolean;

  @Column({ type: "uuid", nullable: true })
  parentEntityId!: string | null;

  @ManyToOne(() => DataModelEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "parentEntityId" })
  parentEntity!: DataModelEntity | null;

  @Column({ type: "float", nullable: true, default: 0 })
  positionX!: number;

  @Column({ type: "float", nullable: true, default: 0 })
  positionY!: number;

  @Column({ type: "float", nullable: true, default: 200 })
  width!: number;

  @Column({ type: "float", nullable: true, default: 100 })
  height!: number;

  @Column({ type: "varchar", nullable: true })
  color!: string | null;

  @Column({ type: "varchar", nullable: true })
  tableName!: string | null;

  @Column({ type: "varchar", default: "active" })
  status!: string;

  @OneToMany(() => DataModelColumn, (col) => col.entity, {
    cascade: true,
    eager: true,
  })
  columns!: DataModelColumn[];

  @OneToMany(() => DataModelRelationship, (rel) => rel.fromEntity)
  outgoingRelationships!: DataModelRelationship[];

  @OneToMany(() => DataModelRelationship, (rel) => rel.toEntity)
  incomingRelationships!: DataModelRelationship[];

  @ManyToOne(() => Application, (o) => o.dataModelEntities, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "applicationId" })
  application!: Application;
}
