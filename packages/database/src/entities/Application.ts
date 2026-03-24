import "reflect-metadata";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { AppBaseEntity } from './BaseEntity';
import { Project } from './Project';
import { randomBytes } from 'crypto';
import { Modules } from './Modules';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { Policy } from "./Policy";
import { Middleware } from "./Middleware";
import { Validators } from "./Validator";
type TypeApp = 'ui' | 'web' | 'mobile' | 'api' | 'cli' | 'library' | 'daemon' | 'worker' | 'microservice' ;

@Entity('applications')
export class Application extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  secretKey?: string;

  @Column({ type: 'varchar', nullable: false, default: 'src' })
  srcDir?: string;

  @Column({ type: 'varchar', nullable: false, default: 'app' })
  moduleDirName?: string;

  @Column({ type: 'varchar', nullable: false, default: 'behaviors' })
  behaviorsDirName?: string;

  @Column({ type: 'varchar', nullable: false, default: 'extras' })
  extrasDirName?: string;

  @Column({ type: 'varchar', nullable: false, default: 'middlewares' })
  middlewaresDirName?: string;

  @Column({ type: 'varchar', nullable: false, default: 'policies' })
  policiesDirName?: string;

  @Column({ type: 'jsonb', nullable: true })
  config?: any;

  @Column({ type: 'varchar', nullable: true })
  type_app?: TypeApp;

  @Column({ type: 'varchar', nullable: true })
  parentId?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastUpdateParent?: Date;

  @Column({ type: 'varchar', default: 'node18', nullable: false })
  runtime?: string;

  @Column({ type: 'varchar', default: 'typescript' })
  language?: string;

  @Column({ type: 'varchar', default: 'damba' })
  framework?: string;

  @Column({ type: 'varchar', default: 'v2' })
  frameworkVersion?: string;

  @Column({ type: 'varchar', nullable: true })
  packageName?: string;

  @Column({ type: 'varchar', length: 160, default: 'localhost' })
  host?: string;

  @Column({ type: 'int', default: 8080 })
  port?: number;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'int', nullable: false, default: 1 })
  version: number | undefined;

  @Column({ type: 'jsonb', nullable: true })
  configFile?: any;

  @Column({ type: 'varchar', nullable: true })
  orgId?: string;

  @Column({ type: 'varchar', nullable: true })
  projId?: string;

  @Column({
    type: 'enum',
    enum: DambaEnvironmentType,
    nullable: true,
  })
  environment?: DambaEnvironmentType;

  @OneToMany(() => Policy, (o) => o.application, { cascade: true })
  policies?: Policy[];

  @OneToMany(() => Middleware, (o) => o.application)
  middlewares?: Middleware[];

  @OneToMany(() => Modules, (m) => m.application, { cascade: true, nullable: true })
  modules!: Modules[];

  @ManyToOne(() => Project, (o) => o.applications, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appId' })
  project?: Project;

  @OneToMany(() => Validators, (o) => o.application)
  validators?: Validators[];

  @BeforeInsert()
  setDefaults() {
    if (!this.secretKey) {
      // 64-hex chars (~256 bits). Adjust length if you want.
      this.secretKey = randomBytes(32).toString('hex');
    }
    if (!this.name) {
      this.name = 'App_' + randomBytes(12).toString('hex');
    }
    if (!this.type_app) {
      this.type_app = 'api';
    }
  }


}
