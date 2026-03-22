// --------------------------------------------
// Behaviors
// --------------------------------------------

import { DEvent } from "@App/damba.import";
import { AgentDefinition, AgentDefinitionStatus, ListingVisibility, AgentListing } from "@Database/entities/agents/contracts/Agents";
import { Behavior, DambaApi } from "@Damba/v2/service/DambaService";
import { CreateListingBody, UpdateListingBody, PublishParams } from "../../../../../packages/validators/src/contracts/AgentListingValidators";

export const createListingBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const body = CreateListingBody.parse(e.in.body);

    // Ensure agent exists and is approved
    const agent = await repo?.DGet1<AgentDefinition>(AgentDefinition, {
      where: { id: body.agentDefinitionId },
    });

    if (!agent) throw new Error("Agent not found");
    if (agent.status !== AgentDefinitionStatus.Approved)
      throw new Error("Agent must be approved before listing");

    const listing = new AgentListing();
    listing.agentDefinitionId = body.agentDefinitionId;
    listing.priceType = body.priceType;
    listing.priceCents = body.priceCents ?? 0;
    listing.currency = body.currency ?? "USD";
    listing.tags = body.tags ?? [];
    listing.visibility = ListingVisibility.Unlisted;
    listing.publishedAt = null;

    // ✅ This service.entity = AgentListing, so api.DSave is allowed
    const saved = await api?.DSave(listing);

    e.out.send({ listing: saved });
  };
};

export const updateListingBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const listingId = e.in.params?.listingId;
    const body = UpdateListingBody.parse(e.in.body);

    const listing = await repo?.DGet1<AgentListing>(AgentListing, {
      where: { id: listingId },
    });

    if (!listing) throw new Error("Listing not found");

    if (body.priceType) listing.priceType = body.priceType;
    if (typeof body.priceCents === "number") listing.priceCents = body.priceCents;
    if (body.currency) listing.currency = body.currency;
    if (body.tags) listing.tags = body.tags;

    const saved = await api?.DSave(listing);

    e.out.send({ listing: saved });
  };
};

export const publishListingBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { listingId } = PublishParams.parse(e.in.params);

    const listing = await repo?.DGet1<AgentListing>(AgentListing, {
      where: { id: listingId },
    });

    if (!listing) throw new Error("Listing not found");

    listing.visibility = ListingVisibility.Public;
    listing.publishedAt = new Date();

    const saved = await api?.DSave(listing);

    e.out.send({ listing: saved });
  };
};

export const unpublishListingBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { listingId } = PublishParams.parse(e.in.params);

    const listing = await repo?.DGet1<AgentListing>(AgentListing, {
      where: { id: listingId },
    });

    if (!listing) throw new Error("Listing not found");

    listing.visibility = ListingVisibility.Unlisted;

    const saved = await api?.DSave(listing);

    e.out.send({ listing: saved });
  };
};

export const deleteListingBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { listingId } = PublishParams.parse(e.in.params);

    await repo?.DDelete(AgentListing, { id: listingId });

    e.out.send({ deleted: true });
  };
};