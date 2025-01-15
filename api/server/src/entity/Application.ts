import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Application extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    name?: string;

    @Column()
    ipProd?: string;

    @Column()
    ipDev?: string;

    @Column()
    returnEndPoint: string;

    @Column()
    token?: string;


}