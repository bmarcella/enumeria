// this class represent association betwen

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
@Entity()
export class EntApp extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number
    // this is for the app name like Memploi
    @Column({ nullable: true })
    appName: string;
    
    // this is for entreprise ID
    @Column({ nullable: true })
    entId: number;


    // this token is for the login
    @Column({ nullable: true })
    tokenEA: string;

}