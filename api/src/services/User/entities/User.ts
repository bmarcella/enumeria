/* eslint-disable @typescript-eslint/no-explicit-any */

import { AppBaseEntity } from '../../../entities/BaseEntity';
import { Organization } from '../../Organization/entities/Organization';
import { JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from './Role';
import { CurrentSetting } from '@Common/Entity/UserDto';

@Entity({ name: 'users' })
export class User extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    nullable: true,
  })
  googleSub!: string; // Google user ID (sub)

  @Column({ nullable: false, unique: true })
  email!: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  picture?: string;

  @Column({ nullable: true })
  issuer?: string; // iss (issuer, e.g. https://accounts.google.com)

  @Column({ nullable: true })
  audience?: string; // aud (audience / client ID)

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable() // creates a join table like "user_roles_user_role"
  authority!: Role[];

  @Column({ nullable: false, default: false })
  disabled?: boolean;

  @Column({ type: 'jsonb', nullable: true })
  currentSetting?: CurrentSetting;

  @OneToMany(() => Organization, (org) => org.user)
  organizations?: Organization[];
}
