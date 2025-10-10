import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { ChatAi } from "./ChatAi";

@Entity()
export class MessageAi extends BaseEntity {

     @PrimaryGeneratedColumn()
     id?: number;
  
    @Column()
     role! : string;
      
     @Column()
     content!: string;

     @ManyToOne(() => ChatAi, chatAi => chatAi.messageAi, { nullable: true })
     chatAi?: ChatAi;
}

