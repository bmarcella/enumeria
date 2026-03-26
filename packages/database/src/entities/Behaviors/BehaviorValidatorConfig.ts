import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Behavior } from ".";
import { DambaFullMeta } from "../BaseEntity";
import { Validators } from "../Validator";

@Entity("behavior_config_validator")
export class BehaviorConfigValidator extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @ManyToOne(() => Validators, { nullable: true })
  @JoinColumn({ name: "bodyId" })
  body!: Validators;

  @ManyToOne(() => Validators, { nullable: true })
  @JoinColumn({ name: "queryId" })
  query!: Validators;

  @ManyToOne(() => Validators, { nullable: true })
  @JoinColumn({ name: "paramsId" })
  params!: Validators;

  @ManyToOne(() => Validators, { nullable: true })
  @JoinColumn({ name: "responseId" })
  response!: Validators;

  @OneToOne(() => Behavior, { nullable: false })
  Behavior?: Behavior;
}
