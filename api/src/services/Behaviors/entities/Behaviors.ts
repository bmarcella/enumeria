/* eslint-disable @typescript-eslint/no-explicit-any */
import { Http } from "@Damba/service/v1/DambaService";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Middleware } from "./Middleware";
import { DambaFullMeta } from "entities/BaseEntity";

export enum Stereotype {
   BEHAVIOR,
   SERVICE,
   ENTITY,
   POLICY,
   MIDDLEWARE,
   INDEX,
   DAMBA,
   MODULE,
   CONFIG,
}


@Entity('codeFile')
export class CodeFile extends DambaFullMeta {

    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ type: 'enum', enum: Stereotype,  nullable: false })
    stereotype?: Stereotype; 
    
    @Column({ type: 'varchar', nullable: false })
    objId?: string;

    @Column({ type: 'varchar', nullable: false })
    fileExtension?: string;

    @Column({ type: 'varchar', nullable: false })
    path?: string;
    
    // REQUIRED FIELD
    @Column({ type: 'varchar',  nullable: false })
    name!: string;
    
    @Column({ type: 'jsonb',  nullable: false })
    data!: any;
}






@Entity('behavior')
export class Behavior extends DambaFullMeta {

    @PrimaryGeneratedColumn('uuid')
    id?: string;
    
    // REQUIRED FIELD
    @Column({ type: 'varchar',  nullable: false })
    name!: string;
    
    @Column({ type: 'enum', enum: Http, nullable: false })
    method!: Http;
    
    @Column({ type: 'varchar',  nullable: false })
    path!: string;
    
    @ManyToMany(() => Middleware, (o) => o.behaviors, { cascade: true })
    @JoinTable({
    name: "behaviors_midlewares", // optional custom join table name
    joinColumn: { name: "behavior_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "midleware_id", referencedColumnName: "id" },
    })
    midlewares?: Middleware [];

    
}