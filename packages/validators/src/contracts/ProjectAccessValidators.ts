import { z } from 'zod';

export const ProjectAccessCreateBody = z.object({
  projectId: z.string().uuid(),
  userId: z.string().min(1),
  groupId: z.string().optional().nullable(),
  accessLevel: z.enum(['read', 'write', 'admin']).default('read'),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const ProjectAccessUpdateBody = z.object({
  accessLevel: z.enum(['read', 'write', 'admin']),
});

export const ModuleAccessOverrideCreateBody = z.object({
  moduleType: z.enum(['data', 'usecase', 'c4', 'code']),
  accessLevel: z.enum(['none', 'read', 'write', 'admin']).default('read'),
});

export const AccessIdParams = z.object({ accessId: z.string().uuid() });
export const OverrideIdParams = z.object({ accessId: z.string().uuid(), overrideId: z.string().uuid() });
export const ProjectAccessCheckBody = z.object({
  userId: z.string().min(1),
  projectId: z.string().uuid(),
  moduleType: z.enum(['data', 'usecase', 'c4', 'code']).optional(),
});
