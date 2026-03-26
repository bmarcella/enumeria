/* eslint-disable @typescript-eslint/no-explicit-any */
// behaviors barrel

import { AppConfig } from '@App/config/app.config';
import { createService, DEvent } from '@App/damba.import';
import { ErrorMessage } from '@Common/error/error';
import { Project } from '@Database/entities/Project';
import { Organization } from '@Database/entities/Organization';
import { OrgMember } from '@Database/entities/OrgMember';
import { User } from '@Database/entities/User';

const auth = AppConfig?.authorization;
const api = createService('/workspace', Project, undefined, [auth?.check(['user'])]);

// GET /current - get current workspace context
api.DGet(
  '/current',
  async (e: DEvent) => {
    try {
      const userId = e.in.payload?.id;
      if (!userId) return e.out.status(401).json({ error: ErrorMessage.NO_TOKEN });
      const user = await e.in.extras.workspace.getUserSetting(e, userId);
      if (!user) return e.out.status(404).json({ error: ErrorMessage.USER_NOT_FOUND });
      return e.out.json(user.currentSetting || null);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
  {
    getUserSetting: async (e: DEvent, userId: string) => {
      return await e.in.DRepository.DGet(User, {
        where: { id: userId },
        select: { id: true, currentSetting: true },
      });
    },
    getOrgsByUser: async (e: DEvent, userId: string) => {
      return await e.in.DRepository.DGet(
        Organization,
        { where: { user: { id: userId } }, relations: { projects: true } },
        true,
      );
    },
    getOrgWithProjects: async (e: DEvent, orgId: string) => {
      return await e.in.DRepository.DGet(Organization, {
        where: { id: orgId },
        relations: { projects: true },
      });
    },
    checkMembership: async (e: DEvent, orgId: string, userId: string) => {
      return await e.in.DRepository.DGet(OrgMember, {
        where: { organizationId: orgId, userId },
      });
    },
    getOrgMembers: async (e: DEvent, orgId: string) => {
      return await e.in.DRepository.DGet(
        OrgMember,
        { where: { organizationId: orgId }, order: { createdAt: 'ASC' } },
        true,
      );
    },
  },
);

// POST /switch - switch workspace
api.DPost(
  '/switch',
  async (e: DEvent) => {
    try {
      const userId = e.in.payload?.id;
      if (!userId) return e.out.status(401).json({ error: ErrorMessage.NO_TOKEN });
      const { orgId } = e.in.body;
      const user = await e.in.extras.workspace.getUserSetting(e, userId) as any;
      if (!user) return e.out.status(404).json({ error: ErrorMessage.USER_NOT_FOUND });
      const currentSetting = user.currentSetting || {};
      const updatedSetting = { ...currentSetting, orgId: orgId || null };
      await e.in.DRepository.DUpdate(User, { id: userId }, { currentSetting: updatedSetting });
      return e.out.json(updatedSetting);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// GET /personal/projects - personal projects
api.DGet(
  '/personal/projects',
  async (e: DEvent) => {
    try {
      const userId = e.in.payload?.id;
      if (!userId) return e.out.status(401).json({ error: ErrorMessage.NO_TOKEN });
      const orgs = await e.in.extras.workspace.getOrgsByUser(e, userId) as any[];
      const projects = orgs?.flatMap((org: any) => org.projects || []) || [];
      return e.out.json(projects);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// GET /org/:orgId/projects - org projects
api.DGet(
  '/org/:orgId/projects',
  async (e: DEvent) => {
    try {
      const userId = e.in.payload?.id;
      if (!userId) return e.out.status(401).json({ error: ErrorMessage.NO_TOKEN });
      const { orgId } = e.in.params;
      const membership = await e.in.extras.workspace.checkMembership(e, orgId, userId);
      if (!membership) return e.out.status(403).json({ error: ErrorMessage.NOT_ATHORIZED });
      const org = await e.in.extras.workspace.getOrgWithProjects(e, orgId) as any;
      if (!org) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      return e.out.json(org.projects || []);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// GET /org/:orgId/members - org members
api.DGet(
  '/org/:orgId/members',
  async (e: DEvent) => {
    try {
      const userId = e.in.payload?.id;
      if (!userId) return e.out.status(401).json({ error: ErrorMessage.NO_TOKEN });
      const { orgId } = e.in.params;
      const membership = await e.in.extras.workspace.checkMembership(e, orgId, userId);
      if (!membership) return e.out.status(403).json({ error: ErrorMessage.NOT_ATHORIZED });
      const members = await e.in.extras.workspace.getOrgMembers(e, orgId);
      return e.out.json(members);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

export default api.done();
