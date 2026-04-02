/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { DambaMeta } from "../BaseEntity";
import { Modules } from "../Modules";
import { Extra } from "../Extra";
import { BehaviorChain } from "../Behaviors/BehaviorChain";

@Entity("app_services")
export class AppServices extends DambaMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: true })
  name?: string;

  @Column({ type: "varchar", nullable: true })
  defaultEntity?: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "jsonb", nullable: true })
  crudConfig?: any;

  @Column({ type: "varchar", nullable: true })
  parentId?: string;

  @Column({ type: "varchar", nullable: false })
  appId?: string;

  @ManyToOne(() => Modules, (o) => o.services, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "moduleId" })
  module?: Modules;

  @OneToMany(() => Extra, (o) => o.appService, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "serviceId" })
  extras?: Extra[];

  @OneToMany(() => BehaviorChain, (o) => o.appService, {
    nullable: true,
    cascade: true,
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn({ name: "serviceId" })
  behaviorChains?: BehaviorChain[];
}
