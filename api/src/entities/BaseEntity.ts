import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column
} from "typeorm";

export class AppBaseEntity {
  @Column({ nullable: true })
  created_by?: string; // Creation date

  @Column({ nullable: true })
  updated_by?: string; // Creation date

  @Column({ nullable: true })
  deleted_by?: string; // Creation date

  @CreateDateColumn({ nullable: true })
  created_at?: Date; // Creation date

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date; // Last updated date

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date; // Deletion date

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
  @Column({ type: "varchar", nullable: false })
  orgId?: string;

  @Column({ type: "varchar", nullable: false })
  projId?: string;
}

export class DambaFullMeta extends DambaMeta {
  @Column({ type: "varchar", nullable: false })
  appId?: string;

  @Column({ type: "varchar", nullable: false })
  moduleId?: string;

  @Column({ type: "varchar", nullable: false })
  servId?: string;
}
