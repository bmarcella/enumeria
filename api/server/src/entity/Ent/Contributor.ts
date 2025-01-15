import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";


@Entity()
export class Contributor extends BaseEntity {


  @PrimaryGeneratedColumn()
  id?: number

  @Column({ nullable: false})
  id_entreprise: string;

  @Column({ nullable: false})
  app_name: string;
 
  @Column({ nullable: false})
  email_receiver: string;
  
  @Column({ nullable: false})
  id_emmiter: string;
  
  @Column({ nullable: false})
  role_name : string;


  @Column({ nullable: false, unique: true })
  code_contribution : string;
  
  @Column({ nullable: false})
  active : boolean;

  @Column({ nullable: false, default: false})
  accept : boolean;

  @Column({ nullable: false, default: false})
  view_accept : boolean;

}