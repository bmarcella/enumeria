import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Organization } from "./Organization"
import { AppBaseEntity } from "./BaseEntity"

/** Project: child records of an Organization */
@Entity('projects')
export class Project extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string


  @ManyToOne(() => Organization, (o) => o.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization

  @Column({ type: 'varchar', length: 160 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string | null


}