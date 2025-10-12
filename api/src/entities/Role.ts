import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { ManyToOne } from 'typeorm';
import { User } from './User';

export  enum RoleName {
    SUPER_ADMIN = 'super_admin',
    BILL_ADMIN = 'bill_admin',
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
export class Role extends BaseEntity{

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true, enum: RoleName, type: 'enum', default: RoleName.USER })
    name!: RoleName;

    @Column({ nullable: true })
    description?: string;
    
    @ManyToOne(() => User, user => user.authority)
    user!: User;
}