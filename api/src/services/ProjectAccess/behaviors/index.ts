/* eslint-disable @typescript-eslint/no-explicit-any */
// behaviors barrel

import { AppConfig } from '@App/config/app.config';
import { createService, DEvent } from '@App/damba.import';
import { ErrorMessage } from '@Common/error/error';
import { ProjectAccess } from '@Database/entities/ProjectAccess';
import { ModuleAccessOverride } from '@Database/entities/ModuleAccessOverride';

const auth = AppConfig?.authorization;
const api = createService('/project-access', ProjectAccess, undefined, [auth?.check(['user'])]);

// POST / - grant access
api.DPost(
  '/',
  async (e: DEvent) => {
    try {
      const body = e.in.body;
      const userId = e.in.payload?.id;
      if (!body.projectId || !body.userId || !body.accessLevel) {
        return e.out.status(400).json({ error: 'projectId, userId, and accessLevel are required' });
      }
      const access = await e.in.DRepository.DSave(ProjectAccess, {
        projectId: body.projectId,
        userId: body.userId,
        groupId: body.groupId || null,
        accessLevel: body.accessLevel,
        grantedBy: userId,
        expiresAt: body.expiresAt || null,
        created_by: userId,
      });
      return e.out.status(201).json(access);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
  {
    getAccessByProject: async (e: DEvent, projectId: string) => {
      return await e.in.DRepository.DGet(
        ProjectAccess,
        { where: { projectId }, relations: { overrides: true }, order: { created_at: 'DESC' } },
        true,
      );
    },
    checkAccess: async (e: DEvent, userId: string, projectId: string) => {
      return await e.in.DRepository.DGet(ProjectAccess, {
        where: { userId, projectId },
        relations: { overrides: true },
      });
    },
  },
);

// GET / - list access entries for a project
api.DGet(
  '/',
  async (e: DEvent) => {
    try {
      const { projectId } = e.in.query;
      if (!projectId) return e.out.status(400).json({ error: 'projectId query parameter is required' });
      const entries = await e.in.extras['project-access'].getAccessByProject(e, projectId);
      return e.out.json(entries);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// PUT /:accessId - update access level
api.DPut(
  '/:accessId',
  async (e: DEvent) => {
    try {
      const { accessId } = e.in.params;
      const body = e.in.body;
      const existing = await e.in.DRepository.DGet(ProjectAccess, { where: { id: accessId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const updated = await e.in.DRepository.DSave(ProjectAccess, {
        ...(existing as any),
        ...body,
        id: accessId,
      });
      return e.out.json(updated);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// DELETE /:accessId - revoke access
api.DDelete(
  '/:accessId',
  async (e: DEvent) => {
    try {
      const { accessId } = e.in.params;
      const existing = await e.in.DRepository.DGet(ProjectAccess, { where: { id: accessId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(ProjectAccess, { id: accessId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// POST /:accessId/overrides - add module override
api.DPost(
  '/:accessId/overrides',
  async (e: DEvent) => {
    try {
      const { accessId } = e.in.params;
      const body = e.in.body;
      const access = await e.in.DRepository.DGet(ProjectAccess, { where: { id: accessId } });
      if (!access) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      if (!body.moduleType || !body.accessLevel) {
        return e.out.status(400).json({ error: 'moduleType and accessLevel are required' });
      }
      const override = await e.in.DRepository.DSave(ModuleAccessOverride, {
        projectAccessId: accessId,
        moduleType: body.moduleType,
        accessLevel: body.accessLevel,
      });
      return e.out.status(201).json(override);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// DELETE /:accessId/overrides/:overrideId - remove override
api.DDelete(
  '/:accessId/overrides/:overrideId',
  async (e: DEvent) => {
    try {
      const { accessId, overrideId } = e.in.params;
      const access = await e.in.DRepository.DGet(ProjectAccess, { where: { id: accessId } });
      if (!access) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const override = await e.in.DRepository.DGet(ModuleAccessOverride, {
        where: { id: overrideId, projectAccessId: accessId },
      });
      if (!override) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(ModuleAccessOverride, { id: overrideId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// POST /check - check access
api.DPost(
  '/check',
  async (e: DEvent) => {
    try {
      const { userId, projectId, moduleType } = e.in.body;
      if (!userId || !projectId) {
        return e.out.status(400).json({ error: 'userId and projectId are required' });
      }
      const access = await e.in.extras['project-access'].checkAccess(e, userId, projectId) as any;
      if (!access) {
        return e.out.json({ hasAccess: false, accessLevel: null });
      }
      if (moduleType) {
        const override = access.overrides?.find(
          (o: ModuleAccessOverride) => o.moduleType === moduleType,
        );
        if (override) {
          return e.out.json({
            hasAccess: override.accessLevel !== 'none',
            accessLevel: override.accessLevel,
          });
        }
      }
      return e.out.json({
        hasAccess: true,
        accessLevel: access.accessLevel,
      });
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

export default api.done();
