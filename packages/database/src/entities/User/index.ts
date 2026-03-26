/* eslint-disable @typescript-eslint/no-explicit-any */
import { JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../Role';
import type { CurrentSetting } from '@Damba/v2/Entity/UserDto';
import { AppBaseEntity } from '../BaseEntity';
import { Organization } from '../Organization';

@Entity({ name: 'users' })
export class User extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, nullable: true })
  googleSub!: string;

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
  issuer?: string;

  @Column({ nullable: true })
  audience?: string;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable()
  authority!: Role[];

  @Column({ nullable: false, default: false })
  disabled?: boolean;

  @Column({ type: 'jsonb', nullable: true })
  currentSetting?: CurrentSetting;

  @OneToMany(() => Organization, (org) => org.user)
  organizations?: Organization[];
}
