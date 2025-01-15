import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Adresse } from "./Adresse";
import { BaseEntity } from "./BaseEntity";
import { ServiceEnt } from "./ServiceEnt";
@Entity()
export class Entreprise extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name?: string;

    @Column({ nullable: true})
    type_ent: string;

    @Column({ nullable: true})
    slogan: string;

    @Column({ nullable: true})
    website: string;

    @Column({ nullable: true})
    compagnie_size: number;
    
    @Column({ nullable: true})
    year_founded : number;

    @Column({ nullable: true})
    description?: string;

    @Column({ nullable: true})
    objectif?: string;


    @Column({ nullable: true})
    mission?: string;

    @Column({ nullable: true})
    vision?: string;
    
    @Column({ nullable: true})
    telephone_a?: string;

    @Column({ nullable: true})
    telephone_b?: string;

    @Column({ nullable: true})
    email_contact?: string;


    @OneToMany(() => Adresse, (adresse) => adresse.entreprise, { cascade: true  })
    adresses: Adresse []


    @Column({ nullable: true , default: false })
    approuved?: boolean;


    @Column()
    userId?: string;
    
    @Column({ nullable: true})
    categorie?: string;

    @OneToMany(() => ServiceEnt, (ent) => ent.entreprise)
    services?: ServiceEnt[];
}