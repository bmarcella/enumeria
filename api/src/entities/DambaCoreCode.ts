import { Column, PrimaryGeneratedColumn } from "typeorm";
import { AppBaseEntity } from "./BaseEntity";

export default class DambaCoreCode extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string ;
  
  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'varchar', nullable: false })
  extension!: string;

  @Column({ type: 'varchar', nullable: false })
  content?: string;
  
  @Column({ type: 'varchar', nullable: false })
  fullPath?: string;

  @Column({ type: 'varchar', nullable: false })
  basePath?: string;

  @Column({ type: 'varchar', nullable: false })
  description?: string;

  @Column({ type: 'varchar', nullable: false, default: 1 })
  version!: string;

}