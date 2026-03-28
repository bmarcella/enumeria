import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { MessageAi } from '../MessageAi';
import { AppBaseEntity } from '../BaseEntity';
import { Project } from '../Project';

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

  @ManyToOne(() => Project, (project) => project.chatAis, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project?: Project;

  @Column()
  model?: string;

  @Column()
  object?: string;

  @Column({ nullable: true })
  summary?: string;

  @Column({ type: 'enum', enum: Service_tier, nullable: true })
  service_tier!: Service_tier;

  @Column()
  system_fingerprint?: string;

  @OneToMany(() => MessageAi, (messageAi) => messageAi.chatAi, { nullable: true, cascade: true })
  messageAi?: MessageAi[];
}
