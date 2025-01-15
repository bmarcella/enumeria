import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entreprise } from "./Entreprise";


@Entity()
export class Adresse {


  @PrimaryGeneratedColumn()
  id?: number


  @Column({ nullable: true})
  name: string;
   


  @Column()
  country: string;

  @Column()
  default: boolean;


  @Column({ nullable: true})
  etat: string;

  @Column({ nullable: true})
  ville : string;


  @Column({ nullable: true})
  rue : string;

  @ManyToOne(() => Entreprise, (entreprise) => entreprise.adresses )
  entreprise: Entreprise;

}