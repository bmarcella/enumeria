
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from "typeorm";
import { Behavior } from "./Behaviors";
import { DambaFullMeta } from "@App/entities/BaseEntity";

@Entity('extra')
export class Extra extends DambaFullMeta {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ type: 'varchar', nullable: false })
    name!: string;

    @ManyToOne(() => Behavior, (p) => p.extras)
    behavior?: Behavior;

}