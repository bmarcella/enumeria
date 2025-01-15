import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';
import { BaseEntity } from '../BaseEntity';

@Entity()
export class Admin extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  id_user?: number;

  @Column({ unique: true, nullable: false })
  keycloakId?: string;
  
}


