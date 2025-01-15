import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseEntity } from './BaseEntity';

@Entity()
export class KcUser extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  sub?: string;

  @Column({  nullable: false})
  given_name: string;

  @Column({ nullable: false })
  family_name: string;
  
  @Column({ unique: true })
  email: string

  @Column({ })
  password: string;

  @Column()
  salt:string;

  
  @Column({ nullable: true, default: 1})
  static_role: number;

}