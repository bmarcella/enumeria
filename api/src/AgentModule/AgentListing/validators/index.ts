
import { PriceType } from "@App/entities/agents/AgentsConfig";
import { z } from "zod";

export const CreateListingBody = z.object({
  agentDefinitionId: z.string().uuid(),
  priceType: z.nativeEnum(PriceType),
  priceCents: z.number().int().nonnegative().optional(),
  currency: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateListingBody = z.object({
  priceType: z.nativeEnum(PriceType).optional(),
  priceCents: z.number().int().nonnegative().optional(),
  currency: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const PublishParams = z.object({
  listingId: z.string().uuid(),
});