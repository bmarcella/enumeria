/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DambaFullMeta } from "../BaseEntity";
import { AppServices } from "../AppServices";
import { Behavior } from "./index";

@Entity("behavior_chain")
export class BehaviorChain extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @OneToMany(() => Behavior, (o) => o.chain)
  behaviors?: Behavior[];

  @ManyToOne(() => AppServices, (o) => o.behaviorChains)
  @JoinColumn({ name: "serviceId" })
  appService?: AppServices;
}
