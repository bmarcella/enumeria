/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DambaFullMeta } from "../BaseEntity";
import { BehaviorHook } from "./BehaviorHook";
import { AppServices } from "../AppServices";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { BehaviorChain } from "./BehaviorChain";

@Entity("behavior")
export class Behavior extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @Column({ type: "varchar", nullable: false })
  path!: string;

  @OneToMany(() => BehaviorHook, (o) => o.behavior)
  hooks?: BehaviorHook[];

  @ManyToOne(() => BehaviorChain, (o) => o.behaviors)
  @JoinColumn({ name: "chain_id" })
  chain?: BehaviorChain;
}
