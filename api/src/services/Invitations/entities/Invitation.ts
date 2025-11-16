import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { AppBaseEntity } from "../../../entities/BaseEntity";

/**
 * Represents an invitation to join an organization
 * as either a member or a contributor.
 */
@Entity({ name: "invitations" })
export class Invitation extends AppBaseEntity{

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /** Organization this invitation belongs to */
  @Column({ type: "uuid" })
  organizationId!: string;

  /** Email of the invitee */
  @Column({ type: "varchar", length: 255 })
  email!: string;

  /** The intended role in the organization */
  @Column({
    type: "varchar",
    length: 32,
    default: "member",
  })
  role!: "member" | "contributor";

  /** User ID of the inviter */
  @Column({ type: "uuid", nullable: true })
  invitedBy!: string | null;

  /** Current invitation status */
  @Column({
    type: "varchar",
    length: 32,
    default: "pending",
  })
  status!: "pending" | "accepted" | "cancelled" | "expired";

  /** When the invitation was accepted */
  @Column({ type: "timestamp", nullable: true })
  acceptedAt?: Date | null;

  /** Who accepted it (if applicable) */
  @Column({ type: "uuid", nullable: true })
  acceptedBy?: string | null;

  /** When the invitation was cancelled/revoked */
  @Column({ type: "timestamp", nullable: true })
  cancelledAt?: Date | null;

  /** Optional message or note from inviter */
  @Column({ type: "text", nullable: true })
  message?: string | null;

  /** Automatically managed timestamps */
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
