/* eslint-disable @typescript-eslint/no-explicit-any */
import { DStereotype } from "@Damba/v2/model/DStereotype";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { DambaFullMeta } from "../BaseEntity";

@Entity("codeFile")
export class CodeFile extends DambaFullMeta {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "enum", enum: DStereotype, nullable: false })
  stereotype?: DStereotype;

  @Column({ type: "varchar", nullable: false })
  applicationId?: string;

  @Column({ type: "varchar", nullable: false })
  projectId?: string;

  @Column({ type: "varchar", nullable: true })
  moduleId?: string;

  @Column({ type: "varchar", nullable: true })
  serviceId?: string;

  @Column({ type: "varchar", nullable: true })
  behaviorId?: string;

  @Column({ type: "varchar", nullable: true })
  fileExtension?: string;

  @Column({ type: "varchar", nullable: true })
  path?: string;

  @Column({ type: "varchar", nullable: false })
  name!: string;

  @Column({ type: "jsonb", nullable: true })
  data!: any;
}
