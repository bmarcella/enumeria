import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'varchar', length: 255,  nullable:true })
  firstName?: string;

  @Column({ type: 'varchar', length: 255, nullable:true })
  lastName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sexe?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ unique: true })
  email?: string;

  @Column({ nullable: true })
  portfolio?: string;

  @Column()
  keycloakId?: string;

  @Column({ nullable: true, default: false })
  approuved?: boolean;

  @Column({ nullable: true, default: 123456 })
  approved_code?: number;


  @Column({ nullable: true })
  reset_code?: string;

  @Column({ nullable: true, default: 0 })
  attempt: number;

  @Column({ nullable: true })
  date_block: Date;

  @Column({ nullable: true })
  static_role: number;

}