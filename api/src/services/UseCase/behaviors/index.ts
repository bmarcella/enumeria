/* eslint-disable @typescript-eslint/no-explicit-any */
// behaviors barrel

import { AppConfig } from '@App/config/app.config';
import { createService, DEvent } from '@App/damba.import';
import { ErrorMessage } from '@Common/error/error';
import { UseCaseActor } from '@Database/entities/usecase/UseCaseActor';
import { UseCase } from '@Database/entities/usecase/UseCase';
import { UseCaseScenario } from '@Database/entities/usecase/UseCaseScenario';
import { UseCaseRelationship } from '@Database/entities/usecase/UseCaseRelationship';

const auth = AppConfig?.authorization;
const api = createService('/use-cases', UseCase, undefined, [auth?.check(['user'])]);

// === ACTORS ===

api.DPost(
  '/actors',
  async (e: DEvent) => {
    try {
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const actor = await e.in.DRepository.DSave(UseCaseActor, {
        ...body,
        created_by: userId,
      });
      return e.out.status(201).json(actor);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
  {
    getActorsByProject: async (e: DEvent, orgId: string, projId: string) => {
      return await e.in.DRepository.DGet(
        UseCaseActor,
        { where: { orgId, projId }, order: { created_at: 'DESC' } },
        true,
      );
    },
  },
);

api.DGet(
  '/actors',
  async (e: DEvent) => {
    try {
      const { orgId, projId } = e.in.query;
      if (!orgId || !projId) return e.out.status(400).json({ error: 'orgId and projId are required' });
      const actors = await e.in.extras['use-cases'].getActorsByProject(e, orgId, projId);
      return e.out.json(actors);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DPut(
  '/actors/:actorId',
  async (e: DEvent) => {
    try {
      const { actorId } = e.in.params;
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const existing = await e.in.DRepository.DGet(UseCaseActor, { where: { id: actorId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const updated = await e.in.DRepository.DSave(UseCaseActor, {
        ...(existing as any),
        ...body,
        id: actorId,
        updated_by: userId,
      });
      return e.out.json(updated);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DDelete(
  '/actors/:actorId',
  async (e: DEvent) => {
    try {
      const { actorId } = e.in.params;
      const existing = await e.in.DRepository.DGet(UseCaseActor, { where: { id: actorId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(UseCaseActor, { id: actorId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// === USE CASES ===

api.DPost(
  '/',
  async (e: DEvent) => {
    try {
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const useCase = await e.in.DRepository.DSave(UseCase, {
        ...body,
        created_by: userId,
      });
      return e.out.status(201).json(useCase);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
  {
    getUseCasesByProject: async (e: DEvent, orgId: string, projId: string) => {
      return await e.in.DRepository.DGet(
        UseCase,
        { where: { orgId, projId }, relations: { scenarios: true }, order: { created_at: 'DESC' } },
        true,
      );
    },
    getUseCaseById: async (e: DEvent, id: string) => {
      return await e.in.DRepository.DGet(UseCase, {
        where: { id },
        relations: { scenarios: true },
      });
    },
  },
);

api.DGet(
  '/',
  async (e: DEvent) => {
    try {
      const { orgId, projId } = e.in.query;
      if (!orgId || !projId) return e.out.status(400).json({ error: 'orgId and projId are required' });
      const useCases = await e.in.extras['use-cases'].getUseCasesByProject(e, orgId, projId);
      return e.out.json(useCases);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DGet(
  '/:useCaseId',
  async (e: DEvent) => {
    try {
      const { useCaseId } = e.in.params;
      const useCase = await e.in.extras['use-cases'].getUseCaseById(e, useCaseId);
      if (!useCase) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      return e.out.json(useCase);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DPut(
  '/:useCaseId',
  async (e: DEvent) => {
    try {
      const { useCaseId } = e.in.params;
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const existing = await e.in.DRepository.DGet(UseCase, { where: { id: useCaseId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const updated = await e.in.DRepository.DSave(UseCase, {
        ...(existing as any),
        ...body,
        id: useCaseId,
        updated_by: userId,
      });
      return e.out.json(updated);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DDelete(
  '/:useCaseId',
  async (e: DEvent) => {
    try {
      const { useCaseId } = e.in.params;
      const existing = await e.in.DRepository.DGet(UseCase, { where: { id: useCaseId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(UseCase, { id: useCaseId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// === SCENARIOS ===

api.DPost(
  '/:useCaseId/scenarios',
  async (e: DEvent) => {
    try {
      const { useCaseId } = e.in.params;
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const useCase = await e.in.DRepository.DGet(UseCase, { where: { id: useCaseId } });
      if (!useCase) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const scenario = await e.in.DRepository.DSave(UseCaseScenario, {
        ...body,
        useCaseId,
        created_by: userId,
      });
      return e.out.status(201).json(scenario);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DPut(
  '/:useCaseId/scenarios/:scenarioId',
  async (e: DEvent) => {
    try {
      const { scenarioId } = e.in.params;
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const existing = await e.in.DRepository.DGet(UseCaseScenario, { where: { id: scenarioId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      const updated = await e.in.DRepository.DSave(UseCaseScenario, {
        ...(existing as any),
        ...body,
        id: scenarioId,
        updated_by: userId,
      });
      return e.out.json(updated);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DDelete(
  '/:useCaseId/scenarios/:scenarioId',
  async (e: DEvent) => {
    try {
      const { scenarioId } = e.in.params;
      const existing = await e.in.DRepository.DGet(UseCaseScenario, { where: { id: scenarioId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(UseCaseScenario, { id: scenarioId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

// === RELATIONSHIPS ===

api.DPost(
  '/relationships',
  async (e: DEvent) => {
    try {
      const body = e.in.body;
      const userId = e.in.payload?.id;
      const rel = await e.in.DRepository.DSave(UseCaseRelationship, {
        ...body,
        created_by: userId,
      });
      return e.out.status(201).json(rel);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
  {
    getRelationshipsByProject: async (e: DEvent, orgId: string, projId: string) => {
      return await e.in.DRepository.DGet(
        UseCaseRelationship,
        { where: { orgId, projId }, order: { created_at: 'DESC' } },
        true,
      );
    },
  },
);

api.DGet(
  '/relationships',
  async (e: DEvent) => {
    try {
      const { orgId, projId } = e.in.query;
      if (!orgId || !projId) return e.out.status(400).json({ error: 'orgId and projId are required' });
      const rels = await e.in.extras['use-cases'].getRelationshipsByProject(e, orgId, projId);
      return e.out.json(rels);
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

api.DDelete(
  '/relationships/:relationshipId',
  async (e: DEvent) => {
    try {
      const { relationshipId } = e.in.params;
      const existing = await e.in.DRepository.DGet(UseCaseRelationship, { where: { id: relationshipId } });
      if (!existing) return e.out.status(404).json({ error: ErrorMessage.NOT_FOUND });
      await e.in.DRepository.DDelete(UseCaseRelationship, { id: relationshipId });
      return e.out.status(204).send();
    } catch (error) {
      return e.out.status(500).json({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  },
);

export default api.done();
