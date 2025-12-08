/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { Middleware } from "./Middleware";
import { DambaFullMeta } from "@App/entities/BaseEntity";
import { Http } from "@Damba/v1/service/IServiceDamba";
import { Extra } from "./Extra";

export enum Stereotype {
  BEHAVIOR,
  SERVICE,
  ENTITY,
  POLICY,
  MIDDLEWARE,
  INDEX,
  DAMBA,
  MODULE,
  CONFIG,
  EXTRA
}

@Entity("codeFile")
export class CodeFile extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "enum", enum: Stereotype, nullable: false })
  stereotype?: Stereotype;

  @Column({ type: "varchar", nullable: false })
  objId?: string;

  @Column({ type: "varchar", nullable: false })
  fileExtension?: string;

  @Column({ type: "varchar", nullable: false })
  path?: string;

  // REQUIRED FIELD
  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "jsonb", nullable: false })
  data!: any;
}

@Entity("behavior")
export class Behavior extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  // REQUIRED FIELD
  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  description?: string;

  @Column({ type: "enum", enum: Http, nullable: false })
  method!: Http;

  @Column({ type: "varchar", nullable: false })
  path!: string;

  @ManyToMany(() => Middleware, (o) => o.behaviors)
  @JoinTable({
    name: "behaviors_midlewares", // optional custom join table name
    joinColumn: { name: "behavior_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "midleware_id", referencedColumnName: "id" }
  })
  midlewares?: Middleware[];

  @OneToMany(() => Extra, (o) => o.behavior, { cascade: true })
  @JoinColumn({ name: "behaviorId" })
  extras?: Extra[];
}
