// src/services/AgentListingService.ts
import {
  BehaviorsChainLooper,
  createDambaService,
  DambaService,
} from "@Damba/v2/service/DambaService";

import { Http } from "@Damba/v2/service/IServiceDamba";;
import { AgentListing } from "@App/entities/agents/Agents";
import { createListingBehavior, updateListingBehavior, publishListingBehavior, unpublishListingBehavior, deleteListingBehavior } from "./Behavior";
import { CreateListingBody } from "./validators";


// --------------------------------------------
// Service
// --------------------------------------------

const service = {
  name: "/agent_listings",
  entity: AgentListing,
} as DambaService;



// --------------------------------------------
// Routes
// --------------------------------------------

const behaviors: BehaviorsChainLooper = {
  "/create": {
    method: Http.POST,
    behavior: createListingBehavior,
    config: { validators: { body: CreateListingBody } },
  },
  "/:listingId": [{
    method: Http.PUT,
    behavior: updateListingBehavior,
  },
  {
    method: Http.DELETE,
    behavior: deleteListingBehavior,
  }],
  "/:listingId/publish": {
    method: Http.POST,
    behavior: publishListingBehavior,
  },
  "/:listingId/unpublish": {
    method: Http.POST,
    behavior: unpublishListingBehavior,
  },
};

export default createDambaService({ service, behaviors });