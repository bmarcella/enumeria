
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Behavior } from "./Behaviors";
import { Policy } from "./Policy";
import { DambaFullMeta } from "@App/entities/BaseEntity";

@Entity('middleware')
export class Middleware extends DambaFullMeta {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ type: 'varchar', nullable: false })
    name!: string;

    @ManyToMany(() => Behavior, (p) => p.midlewares)
    behaviors?: Behavior[];

    @ManyToMany(() => Policy, (o) => o.middlewares)
    @JoinTable({
        name: "policies_midlewares", // optional custom join table name
        joinColumn: { name: "midleware_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "policy_id", referencedColumnName: "id" },
    })
    policies?: Policy[];
}