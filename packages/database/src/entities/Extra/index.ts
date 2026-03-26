import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { DambaFullMeta } from '../BaseEntity';
import { AppServices } from '../AppServices';

@Entity('extra')
export class Extra extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: false, default: true })
  isContextNeeded!: boolean;

  @ManyToOne(() => AppServices, (p) => p.extras)
  appService?: AppServices;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @OneToMany(() => Extra_Hook, (p) => p.extra)
  extra_hooks?: Extra_Hook[];
}

@Entity('extra_hook')
export class Extra_Hook extends DambaFullMeta {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @ManyToOne(() => Extra, (p) => p.extra_hooks)
  extra?: Extra;

  @Column({ type: 'json', nullable: true })
  inputs?: any;

  @Column({ type: 'json', nullable: true })
  outputs?: any;

  @Column({ type: 'varchar', nullable: true })
  type?: string;
}
