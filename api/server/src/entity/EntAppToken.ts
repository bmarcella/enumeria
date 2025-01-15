// this class represent association betwen

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
@Entity()
export class EntAppToken extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number
    // this is for the app name like Memploi
    @Column({ nullable: true })
    EntAppId?: number;
    
    // this is for entreprise ID
    @Column({ nullable: true })
    id_user: string;


    // this token is for the login
    @Column({ nullable: true })
    token: string;

}