import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Middleware } from "./Middleware";
import { DambaFullMeta } from "@App/entities/BaseEntity";

@Entity("policy")
export class Policy extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @ManyToMany(() => Middleware, (p) => p.policies)
  middlewares?: Middleware[];
}
