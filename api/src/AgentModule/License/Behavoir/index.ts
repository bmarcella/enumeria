import { PriceType, License, LicenseStatus } from '@Database/entities/agents/contracts/Agents';
import {
  OrgParams,
  InstallAgentBody,
  PurchaseAgentBody,
} from '@Validators/contracts/AgentDefinitionValidators';
import { Behavior, DambaApi } from '@Damba/v2/service/DambaService';
import { DEvent } from '@Damba/v2/service/DEvent';

export const installFreeAgentBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { orgId } = OrgParams.parse(e.in.params);
    const { agentDefinitionId } = InstallAgentBody.parse(e.in.body);

    await e.in.extras.marketplace_extras.loadApprovedAgent(agentDefinitionId);
    const listing = await e.in.extras.marketplace_extras.loadListing(agentDefinitionId);

    if (listing.priceType !== PriceType.Free) throw new Error('Agent is not free');

    const license = await e.in.extras.marketplace_extras.getOrCreateActiveLicense(
      orgId,
      agentDefinitionId,
      null,
    );

    e.out.send({ license });
  };
};

export const purchaseOneTimeBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { orgId } = OrgParams.parse(e.in.params);
    const { agentDefinitionId } = PurchaseAgentBody.parse(e.in.body);

    await e.in.extras.marketplace_extras.loadApprovedAgent(agentDefinitionId);
    const listing = await e.in.extras.marketplace_extras.loadListing(agentDefinitionId);

    if (listing.priceType === PriceType.Free) {
      const license = await e.in.extras.marketplace_extras.getOrCreateActiveLicense(
        orgId,
        agentDefinitionId,
        null,
      );
      return e.out.send({ license, purchase: null });
    }

    const purchase = await e.in.extras.marketplace_extras.createPaidPurchase(
      orgId,
      agentDefinitionId,
      listing.priceCents ?? 0,
      listing.currency ?? 'USD',
    );

    const license = await e.in.extras.marketplace_extras.getOrCreateActiveLicense(
      orgId,
      agentDefinitionId,
      purchase.id,
    );

    e.out.send({ purchase, license });
  };
};

export const listOrgLibraryBehavior: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const repo = api?.DRepository();
    const { orgId } = OrgParams.parse(e.in.params);

    const licenses = await repo?.DGetAll<License>(License, {
      where: { buyerOrgId: orgId, status: LicenseStatus.Active },
    });

    e.out.send({ licenses: licenses ?? [] });
  };
};
