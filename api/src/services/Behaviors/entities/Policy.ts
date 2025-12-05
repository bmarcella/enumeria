
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Middleware } from "./Middleware";
import { DambaFullMeta } from "entities/BaseEntity";

@Entity('policy')
export class Policy extends DambaFullMeta {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ type: 'varchar',  nullable: false })
    name!: string;

    @ManyToMany(() => Middleware, (p) => p.policies, { cascade: true })
    middlewares?: Middleware[];
}