import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column } from 'typeorm';

export class AppBaseEntity {
  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;

  @Column({ nullable: true })
  deleted_by?: string;

  @CreateDateColumn({ nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @Column({ default: false })
  edit?: boolean;

  @Column({ default: false })
  view?: boolean;

  @Column({ default: false })
  remove?: boolean;

  @Column({ default: false })
  lock?: boolean;

  @Column({ default: false })
  archived?: boolean;
}

export class DambaMeta extends AppBaseEntity {
  @Column({ type: 'varchar', nullable: false })
  orgId?: string;

  @Column({ type: 'varchar', nullable: false })
  projId?: string;
}

export class DambaFullMeta extends DambaMeta {
  @Column({ type: 'varchar', nullable: false })
  appId?: string;

  @Column({ type: 'varchar', nullable: false })
  moduleId?: string;

  @Column({ type: 'varchar', nullable: false })
  servId?: string;
}
