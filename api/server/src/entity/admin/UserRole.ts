import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
}


@Entity()
export class UserRole extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  keycloakId?: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.SUPER_ADMIN
  })
  role_name?: Role;

}

