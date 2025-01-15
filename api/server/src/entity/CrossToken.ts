import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
@Entity()
export class CrossToken extends BaseEntity {

    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    token?: string;

    @Column({ nullable : true })
    returnUrl?: string;

    @Column({ nullable : true })
    origin?: string;

    @Column()
    appName: string;

    @Column({ nullable : true })
    defaultApp: string;

    @Column({ nullable: true })
    kCToken?: string;

    @Column({ nullable: true })
    refresh_token?: string;

    @Column({ default: 0 })
    type_login:number;

    @Column({ nullable: true })
    userId: string;

}