import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Test extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name?: string;

}

