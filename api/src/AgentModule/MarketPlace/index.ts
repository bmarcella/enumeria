// src/services/MarketplaceExtrasService.ts
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaApi,
  DambaService,
  DExtrasHandler,
  Extras,
} from "@Damba/v2/service/DambaService";
import { Http } from "@Damba/v2/service/IServiceDamba";


import Ajv from "ajv";
import { AgentDefinition, AgentDefinitionStatus, AgentListing, License, LicenseStatus, LicenseType, Purchase, PurchaseStatus } from "@Database/entities/agents/contracts/Agents";
import { pingBehavior } from "./Behaviors";

const ajv = new Ajv({ allErrors: true });

const service = {
  // IMPORTANT: runtime extras key will likely become "marketplace_extras"
  // because the service name is "/marketplace_extras"
  name: "/marketplace_extras",
  entity: AgentDefinition,
} as DambaService;


export const marketplaceExtras: Extras = (api?: DambaApi): DExtrasHandler => {
  return {
    // Optional request helpers
    getQuery() {
      return api?.params().query;
    },
    getParams() {
      return api?.params().params;
    },
    getBody<T = any>() {
      return api?.params().body as T;
    },

    async loadApprovedAgent(agentDefinitionId: string) {
      const repo = api?.DRepository();
      const agent = await repo?.DGet1<AgentDefinition>(AgentDefinition, {
        where: { id: agentDefinitionId },
      });

      if (!agent || agent.status !== AgentDefinitionStatus.Approved) {
        throw new Error("Agent not available");
      }
      return agent;
    },

    async loadListing(agentDefinitionId: string) {
      const repo = api?.DRepository();
      const listing = await repo?.DGet1<AgentListing>(AgentListing, {
        where: { agentDefinitionId },
      });
      if (!listing) throw new Error("Listing not found");
      return listing;
    },

    async requireActiveLicense(buyerOrgId: string, agentDefinitionId: string) {
      const repo = api?.DRepository();
      const license = await repo?.DGet1<License>(License, {
        where: { buyerOrgId, agentDefinitionId, status: LicenseStatus.Active },
      });

      if (!license) throw new Error("License required");
      return license;
    },

    async getOrCreateActiveLicense(buyerOrgId: string, agentDefinitionId: string, purchaseId: string | null) {
      const repo = api?.DRepository();

      const existing = await repo?.DGet1<License>(License, {
        where: { buyerOrgId, agentDefinitionId, status: LicenseStatus.Active },
      });
      if (existing) return existing;

      const license = new License();
      license.buyerOrgId = buyerOrgId;
      license.agentDefinitionId = agentDefinitionId;
      license.purchaseId = purchaseId;
      license.licenseType = LicenseType.OrgWide;
      license.status = LicenseStatus.Active;
      license.activatedAt = new Date();

      // ✅ generic save (NOT api.DSave)
      return await repo?.DSave(License, license);
    },

    validateConfig(inputsSchema: any | null, config: Record<string, any>) {
      if (!inputsSchema) return true;
      const validate = ajv.compile(inputsSchema);
      const ok = validate(config);
      if (!ok) throw new Error(`Invalid config: ${ajv.errorsText(validate.errors)}`);
      return true;
    },

    async createPaidPurchase(buyerOrgId: string, agentDefinitionId: string, amountCents: number, currency: string) {
      const repo = api?.DRepository();

      const purchase = new Purchase();
      purchase.buyerOrgId = buyerOrgId;
      purchase.agentDefinitionId = agentDefinitionId;
      purchase.amountCents = amountCents;
      purchase.currency = currency;
      purchase.provider = "manual" as any;
      purchase.status = PurchaseStatus.Paid;

      // ✅ generic save (NOT api.DSave)
      return await repo?.DSave(Purchase, purchase);
    },
  };
};


const behaviors: BehaviorsChainLooper = {
  "/ping": {
    method: Http.GET,
    behavior: pingBehavior,
    extras: marketplaceExtras,
  },
};

export default createDambaService({ service, behaviors });