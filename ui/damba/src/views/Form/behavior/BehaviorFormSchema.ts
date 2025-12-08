import { z } from "zod";
import { Http  } from "../../../../../../common/Damba/v1/service/IServiceDamba";
export const BehaviorFormSchema = z.object({
    name: z.string().min(1, 'Required'),
    method: z.nativeEnum(Http),
     // Many-to-many: choose middlewares (by id)
    middlewareIds: z.array(z.string()).optional().default([]),

    // One-to-many: extras
    extras: z
    .array(
      z.object({
        name: z.string().min(1, 'Required'),
        value: z.string().optional().default(''),
      })
    )
    .optional()
    .default([]),
    path: z
        .string()
        .min(1, 'Required')
        .refine((p) => p.startsWith('/'), 'Path must start with "/"'),
})
