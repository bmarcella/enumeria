import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatAi } from './ChatAi';
import { AppBaseEntity } from './BaseEntity';

@Entity()
export class MessageAi extends AppBaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  role!: string;

  @Column()
  content!: string;

  @ManyToOne(() => ChatAi, (chatAi) => chatAi.messageAi, { nullable: true })
  chatAi?: ChatAi;
}
