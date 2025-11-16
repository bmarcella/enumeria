import { Entity, Unique, PrimaryGeneratedColumn, Index, Column, ManyToOne, JoinColumn } from "typeorm"
import { AppBaseEntity } from "../../../entities/BaseEntity"
import { Organization } from "./Organization"

/** OrgDomain: verified email/login domains */
@Entity('org_domains')
@Unique('uniq_org_domain', ['organizationId', 'domain'])
export class OrgDomain extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column('uuid')
  organizationId!: string

  @ManyToOne(() => Organization, (o) => o.domains, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization

  @Index()
  @Column({ type: 'varchar', length: 190 })
  domain!: string

  @Column({ type: 'boolean', default: false })
  verified!: boolean

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt?: Date | null

}
