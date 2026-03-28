import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AppBaseEntity } from "../BaseEntity";
@Entity()
export class Test extends AppBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;
}
