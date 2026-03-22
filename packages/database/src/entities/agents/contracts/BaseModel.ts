import { PrimaryGeneratedColumn } from "typeorm";
import { AppBaseEntity } from "../../BaseEntity";

export abstract class BaseModel extends AppBaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;
}