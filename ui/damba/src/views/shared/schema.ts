
import { z } from "zod";
export const USER_ROLES = ['user', "super_manager","vendeur",
     "proprietaire", 'vendor_management', 
      "reference", "agent_immobilier", "coordonator", 
      "assist_coordonator", "manager", "assist_manager",
       "operation", "admin", "fields_ops", 'accountant', 'assist_accountant'] as const;
export type  USER_ROLE = typeof USER_ROLES[number];
export const ProprioSchema = z.object({
    id: z.string().optional(),
    fullName: z.string().min(1, 'Full name is required'),
    nickName: z.string().optional(),
    city: z.string().optional(),
    companyName: z.string().optional(),
    nif: z.string().optional(),
    cin: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone is required'),
    phone_b: z.string().optional(),
    website: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    documents: z.array(z.any()).optional(),
    type_person: z.enum(USER_ROLES),
    regions : z.array(z.number().optional()),
  })

  export const RoleSchema = z.object({
    type_person: z.enum(USER_ROLES),
    regions : z.array(z.number().optional()),
  })