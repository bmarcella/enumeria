import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { MessageAi } from './MessageAi';
import { AppBaseEntity } from './BaseEntity';

export enum Service_tier {
  default = 'default',
  scale = 'scale',
}

@Entity()
export class ChatAi extends AppBaseEntity {
  @PrimaryColumn()
  id?: string;

  @Column()
  initial_prompt?: string;

  @Column()
  model?: string;

  @Column()
  object?: string;

  @Column({ nullable: true })
  summary?: string;

  @Column({
    type: 'enum',
    enum: Service_tier,
    nullable: true,
  })
  service_tier!: Service_tier;

  @Column()
  system_fingerprint?: string;

  @OneToMany(() => MessageAi, (messageAi) => messageAi.chatAi, { nullable: true, cascade: true })
  messageAi?: MessageAi[];
}
