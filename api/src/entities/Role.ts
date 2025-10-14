import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './User';
import { AppBaseEntity } from './BaseEntity';

export  enum RoleName {
    SUPER_ADMIN = 'super_admin',
    BILL_ADMIN = 'bill_admin',
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
export class Role extends AppBaseEntity{

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true, enum: RoleName, type: 'enum', default: RoleName.USER })
    name!: RoleName;

    @Column({ nullable: true })
    description?: string;
     // Many-to-Many: A role can be assigned to many users
    @ManyToMany(() => User, user => user.authority)
    users?: User[];

}