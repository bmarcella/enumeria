import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"
import { AppBaseEntity } from "./BaseEntity"

@Entity('app_modules')
export class AppModuleEntity extends AppBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ type: 'varchar', length: 160 })
    name!: string

    @Column({ type: 'text', nullable: true })
    description?: string | null

    /** back-reference to Application is set below */
    @Column({ type: 'uuid', nullable: true })
    applicationId?: string | null
}