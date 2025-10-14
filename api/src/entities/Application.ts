import { Entity, Index, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"
import { AppModuleEntity } from "./AppModuleEntity"
import { Config, Environments } from "./Organization"
import { AppBaseEntity } from "./BaseEntity"
import { User } from "./User"

export enum ApplicationType {
    WEB = 'web',
    MOBILE = 'mobile',
    API = 'api',
    CLI = 'cli',
    LIBRARY = 'library',
}

@Entity('contributors')
export class AppContributorEntity extends AppBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: 'varchar', length: 160 })
    name!: string

    @Column({ type: 'varchar', length: 80, nullable: true })
    role?: string | null
}



@Entity('applications')
@Index('idx_application_name', ['name'])
export class ApplicationEntity extends AppBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: 'varchar', length: 160 })
    name!: string

    @Column({ type: 'text', nullable: true })
    description?: string | null

    // relations
    @OneToMany(() => AppModuleEntity, (m) => m.applicationId, {
        cascade: ['insert', 'update'],
        eager: false,
    })
    modules!: AppModuleEntity[]

    @ManyToMany(() => AppContributorEntity, { eager: false })
    @JoinTable({
        name: 'application_contributors',
        joinColumn: { name: 'application_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'contributor_id', referencedColumnName: 'id' },
    })
    contributors?: AppContributorEntity[]

    // config & environments
    @Column({ type: 'jsonb', nullable: true })
    config?: any

    @Column({ type: 'enum', enum: ApplicationType, nullable: true })
    type?: ApplicationType | null

    @Column({ type: 'varchar', length: 60, nullable: true })
    runtime?: string | null

    @Column({ type: 'varchar', length: 60, nullable: true })
    language?: string | null

    @Column({ type: 'varchar', length: 40, nullable: true })
    version?: string | null

    // ownership
    // @ManyToOne(() => User, user => user.applications)
    // user!: User;

    // arrays & structured fields
    @Column({ type: 'jsonb', nullable: true })
    dependencies?: string[] | null

    @Column({ type: 'jsonb', nullable: true })
    environments?: Environments | null

    @Column({ type: 'jsonb', nullable: true })
    tags?: string[] | null
}