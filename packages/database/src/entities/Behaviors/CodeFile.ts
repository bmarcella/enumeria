/* eslint-disable @typescript-eslint/no-explicit-any */
import { DStereotype } from "@Damba/v2/model/DStereotype";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { AppBaseEntity } from "../BaseEntity";
import { DambaEnvironmentType } from "@Damba/v2/Entity/env";

@Entity("codeFile")
export class CodeFile extends AppBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ type: "varchar", nullable: true })
  name!: string;

  @Column({ type: "enum", enum: DStereotype, nullable: false })
  stereotype?: DStereotype;

  @Column({ type: "varchar", nullable: true })
  applicationId?: string;

  @Column({ type: "varchar", nullable: true })
  projectId?: string;

  @Column({ type: "varchar", nullable: true })
  moduleId?: string;

  @Column({ type: "varchar", nullable: true })
  serviceId?: string;

  @Column({ type: "varchar", nullable: true })
  behaviorId?: string;

  @Column({ type: "varchar", nullable: true })
  fileExtension!: string;

  @Column({ type: "varchar", nullable: true })
  path?: string;

  @Column({ type: "jsonb", nullable: true })
  data!: any;

  @Column({
    type: "enum",
    enum: DambaEnvironmentType,
    nullable: false,
    default: DambaEnvironmentType.DEV,
  })
  environment!: DambaEnvironmentType;
}
