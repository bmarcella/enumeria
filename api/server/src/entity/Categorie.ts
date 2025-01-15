import { Entity, PrimaryGeneratedColumn, Column, TreeChildren, TreeParent, Tree } from "typeorm";
import { BaseEntity } from "./BaseEntity";
@Entity()
@Tree("closure-table")
export class Categorie  extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    name?: string;

    @Column({nullable: true,  default:"services" })
    type_ent?: string;

    @Column()
    icon?: string;
    
    @Column()
    description: string

    @TreeChildren()
    children: Categorie[]

    @TreeParent()
    parent: Categorie;

    @Column()
    type_categorie?: string;
}