import { AgentListing, ListingVisibility, AgentDefinition, AgentDefinitionStatus } from "@Database/entities/agents/contracts/Agents";
import { BrowseAgentsQuery } from "@Validators/contracts/AgentDefinitionValidators";
import { Behavior, DambaApi } from "@Damba/v2/service/DambaService";
import { DEvent } from "@Damba/v2/service/DEvent";

export const browseAgentsBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const q = BrowseAgentsQuery.parse(e.in.query ?? {});

    // MVP: simple fetch then filter
    const listings = await repo?.DGetAll<AgentListing>(AgentListing, {
      where: { visibility: ListingVisibility.Public },
    });

    const items: any[] = [];
    for (const l of listings ?? []) {
      const a = await repo?.DGet1<AgentDefinition>(AgentDefinition, {
        where: { id: l.agentDefinitionId, status: AgentDefinitionStatus.Approved },
      });
      if (!a) continue;

      if (q.roleType && a.roleType !== q.roleType) continue;
      if (q.priceType && l.priceType !== q.priceType) continue;
      if (q.tag && !(l.tags ?? []).includes(q.tag)) continue;

      if (q.q) {
        const needle = q.q.toLowerCase();
        const hay = `${a.name} ${a.description}`.toLowerCase();
        if (!hay.includes(needle)) continue;
      }

      items.push({ listing: l, agent: a });
    }

    e.out.send({ items });
  };
};

export const getAgentBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const agentDefinitionId = e.in.params?.agentDefinitionId;

    const agent = await repo?.DGet1<AgentDefinition>(AgentDefinition, {
      where: { id: agentDefinitionId, status: AgentDefinitionStatus.Approved },
    });
    if (!agent) throw new Error("Agent not found");

    const listing = await repo?.DGet1<AgentListing>(AgentListing, {
      where: { agentDefinitionId },
    });

    e.out.send({ agent, listing: listing ?? null });
  };
};