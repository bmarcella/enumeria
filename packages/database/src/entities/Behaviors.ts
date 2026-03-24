/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DambaFullMeta } from './BaseEntity';
import { Http } from '@Damba/v1/service/IServiceDamba';
import { Extra } from './Extra';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';
import { Policy } from './Policy';
import { DStereotype } from "@Damba/v2/model/DStereotype";
import { Validators } from './Validator';

@Entity('codeFile')
export class CodeFile extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'enum', enum: DStereotype, nullable: false })
  stereotype?: DStereotype;

  @Column({ type: 'varchar', nullable: false })
  applicationId?: string;

  @Column({ type: 'varchar', nullable: false })
  projectId?: string;

  @Column({ type: 'varchar', nullable: false })
  orgId?: string;

  @Column({ type: 'varchar', nullable: false })
  moduleId?: string;

  @Column({ type: 'varchar', nullable: false })
  serviceId?: string;

  @Column({ type: 'varchar', nullable: false })
  behaviorId?: string;

  @Column({ type: 'varchar', nullable: false })
  fileExtension?: string;

  @Column({ type: 'varchar', nullable: false })
  path?: string;

  // REQUIRED FIELD
  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'jsonb', nullable: false })
  data!: any;

}



@Entity('behavior')
export class Behavior extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  
  // REQUIRED FIELD
  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: Http, nullable: false })
  method!: Http;

  @Column({ type: 'varchar', nullable: false })
  path!: string;

  @Column({
    type: 'enum',
    enum: DambaEnvironmentType,
    nullable: true,
  })
  environment?: DambaEnvironmentType;

  @ManyToMany(() => Policy, (o) => o.behaviors)
  @JoinTable({
    name: 'behaviors_policies', // optional custom join table name
    joinColumn: { name: 'behavior_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'policy_id', referencedColumnName: 'id' },
  })
  policies?: Policy[];
  
}


@Entity('behavior_config_validator')
export class BehaviorConfigValidator extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => Validators, { nullable: true })
  @JoinColumn({ name: 'bodyId' })
  body!: Validators;

  @ManyToOne(() => Validators, { nullable: true })  
  @JoinColumn({ name: 'queryId' })
  query!: Validators;


  @ManyToOne(() => Validators, { nullable: true })  
  @JoinColumn({ name: 'paramsId' })
  params!: Validators;

  @ManyToOne(() => Validators, { nullable: true })  
  @JoinColumn({ name: 'responseId' })
  response!: Validators;
  

}