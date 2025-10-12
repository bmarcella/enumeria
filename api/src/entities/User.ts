
import { AppBaseEntity } from "./BaseEntity";
import { Organization } from './Organization';
import { Role } from "./Role";
import { OneToMany } from "typeorm";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity({ name: 'users' })

export class User extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    unique: true,
    nullable: true
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


  @OneToMany(() => Role, role => role.user)
  authority!: Role[];

  @Column({ nullable: false, default: false })
  disabled?: boolean;

  @Column({ type: 'varchar', nullable: true })
  currentOrgId!: string;

  @Column({ type: 'varchar', nullable: true })
  currentProjId!: string;

  @Column({ type: 'varchar', nullable: true })
  currentAppId!: string;


  @OneToMany(() => Organization, org => org.user)
  organizations?: Organization[];


}
