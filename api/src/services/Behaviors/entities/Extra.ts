import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Behavior } from "./Behaviors";
import { DambaFullMeta } from "@App/entities/BaseEntity";

@Entity("extra")
export class Extra extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "varchar", nullable: false, default: true })
  isContextNeeded!: boolean;

  @ManyToOne(() => Behavior, (p) => p.extras)
  behavior?: Behavior;

  @Column({ type: "varchar", nullable: true })
  description?: string;
}
