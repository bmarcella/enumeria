/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DambaFullMeta } from "../BaseEntity";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { Policy } from "../Policy";
import { DStereotype } from "@Damba/v2/model/DStereotype";
import { BehaviorConfigValidator } from "./BehaviorValidatorConfig";



@Entity("behavior")
export class Behavior extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @Column({ type: "enum", enum: Http, nullable: false })
  method!: Http;

  @Column({ type: "varchar", nullable: false })
  path!: string;

  @ManyToMany(() => Policy, (o) => o.behaviors)
  @JoinTable({
    name: "behaviors_policies",
    joinColumn: { name: "behavior_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "policy_id", referencedColumnName: "id" },
  })
  policies?: Policy[];

  @OneToOne(() => BehaviorConfigValidator, { nullable: true })
  @JoinColumn({ name: "configId" })
  config?: BehaviorConfigValidator;
}
