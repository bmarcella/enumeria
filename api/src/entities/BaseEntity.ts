import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column } from "typeorm";

export class AppBaseEntity  {

  @Column({ nullable: true })
  created_by?: string; // Creation date
  
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