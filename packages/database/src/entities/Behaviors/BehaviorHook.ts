import { Http } from "@Damba/v2/service/IServiceDamba";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { DambaFullMeta } from "../BaseEntity";
import { Policy } from "../Policy";
import { BehaviorConfigValidator } from "./BehaviorValidatorConfig";
import { Behavior } from ".";

@Entity("behavior_hook")
export class BehaviorHook extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "enum", enum: Http, nullable: false })
  method!: Http;

  // note: policies is chain of meddlewares to be executed in order
  @ManyToMany(() => Policy, (o) => o.behaviorHooks)
  @JoinTable({
    name: "behavior_hooks_policies",
    joinColumn: { name: "behavior_hook_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "policy_id", referencedColumnName: "id" },
  })
  policies?: Policy[];

  @OneToOne(() => BehaviorConfigValidator, { nullable: true })
  @JoinColumn({ name: "configId" })
  config?: BehaviorConfigValidator;

  @ManyToOne(() => Behavior, (o) => o.hooks)
  @JoinColumn({ name: "behaviorId" })
  behavior?: Behavior;
}
