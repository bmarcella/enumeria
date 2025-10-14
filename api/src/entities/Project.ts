import { Entity, Index, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Organization } from "./Organization"
import { AppBaseEntity } from "./BaseEntity"

/** Project: child records of an Organization */
@Entity('projects')
@Index(['slug'], { unique: true, where: 'slug IS NOT NULL' })
@Index(['key'], { unique: true, where: 'key IS NOT NULL' })
export class Project extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string


  @ManyToOne(() => Organization, (o) => o.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization

  @Column({ type: 'varchar', length: 160 })
  name!: string

  @Column({ type: 'varchar', length: 16, nullable: true })
  key?: string | null

  @Column({ type: 'varchar', length: 190, nullable: true })
  slug?: string | null

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date
}