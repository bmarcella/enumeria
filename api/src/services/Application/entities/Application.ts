
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BeforeInsert, OneToMany } from "typeorm"
import { AppBaseEntity } from "../../../entities/BaseEntity"
import { Project } from "../../Projects/entities/Project"
import { randomBytes } from 'crypto';
import { Modules } from "@App/services/Modules/entities/Modules";
type TypeApp = "web" | "mobile" | "api" | "cli" | "library";
/** Project: child records of an Organization */
@Entity('applications')
export class Application extends AppBaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  secretKey?: string;


  @Column({ type: 'varchar', nullable: false, default: "src" })
  srcDir?: string;

  @Column({ type: 'jsonb', nullable: true })
  config?: any;

  @Column({ type: 'varchar', nullable: true })
  type_app?: TypeApp;


  @Column({ type: 'varchar', nullable: true })
  parentId?: string;


  @Column({ type: 'timestamp', nullable: true })
  lastUpdateParent?: Date;

  @Column({ type: 'varchar', default: "node18", nullable: false })
  runtime?: string;

  @Column({ type: 'varchar', default: "typescript" })
  language?: string;

  @Column({ type: 'varchar', default: "damba" })
  framework?: string;

  @Column({ type: 'varchar', nullable: true })
  packageName?: string;

  @Column({ type: 'varchar', length: 160, default: 'localhost' })
  host?: string

  @Column({ type: 'int', default: 8080 })
  port?: number

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @Column({ type: 'int', nullable: false, default: 1 })
  version: number | undefined;

  @Column({ type: 'jsonb', nullable: true })
  configFile?: any;

  @Column({ type: 'varchar', nullable: true })
  orgId?: string;

  @ManyToOne(() => Project, (o) => o.applications, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appId' })
  project?: Project;


  @BeforeInsert()
  setDefaults() {
    if (!this.secretKey) {
      // 64-hex chars (~256 bits). Adjust length if you want.
      this.secretKey = randomBytes(32).toString('hex');
    }
    if (!this.name) {
      this.name = "App_" + randomBytes(12).toString('hex');
    }
    if (!this.type_app) {
      this.type_app = 'api';
    }
  }

  @OneToMany(() => Modules, (m) => m.application, { cascade: true, nullable: true })
  modules!: Modules[];

}