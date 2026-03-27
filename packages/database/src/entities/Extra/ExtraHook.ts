import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Extra } from ".";
import { DambaFullMeta } from "../BaseEntity";

@Entity("extra_hook")
export class Extra_Hook extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @ManyToOne(() => Extra, (p) => p.extra_hooks)
  extra?: Extra;

  @Column({ type: "json", nullable: true })
  inputs?: any;

  @Column({ type: "json", nullable: true })
  outputs?: any;

  @Column({ type: "varchar", nullable: true })
  type?: string;
}
