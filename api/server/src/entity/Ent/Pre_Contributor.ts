import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";


@Entity()
export class Pre_Contributor extends BaseEntity {


  @PrimaryGeneratedColumn()
  id?: number

  @Column({ nullable: false})
  id_entreprise: string;

  @Column({ nullable: false})
  app_name: string;
 
  @Column({ nullable: false})
  id_entity: number;
  
  @Column({ nullable: false, unique: true })
  code_activation : string;

  @Column({ nullable: false, unique: true })
  pin_activation : number;
  
  @Column({ nullable: false, default:false})
  active : boolean;

  @Column({ nullable: false, default: false})
  accept : boolean;

  @Column({ nullable: false, default: false})
  view_accept : boolean;


}