import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { Entreprise } from "./Entreprise";
import { BaseEntity } from "./BaseEntity";
@Entity()
export class ServiceEnt extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number
    date_debut?: string ;
    date_fin?: string ;

    @Column()
    type_service : string;

    @Column()
    categorie_service : string;

    @Column()
    price: number;

    @Column()
    reccurence: string;

    @Column()
    active: boolean ;

    @ManyToOne(() => Entreprise, (ent) => ent.services)
    entreprise?: Entreprise;
}