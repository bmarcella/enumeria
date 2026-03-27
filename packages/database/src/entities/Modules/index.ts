/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Application } from "../Application";
import { AppServices } from "../AppServices";
import { DambaMeta } from "../BaseEntity";

@Entity("modules")
export class Modules extends DambaMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: true })
  name?: string;

  @Column({ type: "text", nullable: true })
  codeFileContent?: string | null;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @ManyToOne(() => Application, (o) => o.modules, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "applicationId" })
  application?: Application;

  @OneToMany(() => AppServices, (m) => m.module, {
    cascade: true,
    nullable: true,
  })
  services?: AppServices[];
}
