const TestServiceExample = `
import { BehaviorsChainLooper, createDambaService, DambaService } from "@Damba/v2/service/DambaService";
import { testBehavior } from "./behaviors/testBehavior";
import { testExtra } from "./behaviors/extras/testExtra";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { Entity } from "./entities/Entity";
// Define the service
const service = {
    name : "/service_name",
    entity: Entity
} as DambaService

// Define the behaviors
const behaviors: BehaviorsChainLooper = {
  "/test-behavior/:params" : {
      method: Http.GET,
      behavior: testBehavior,
      extras : testExtra
  }
};

export default  createDambaService( { service, behaviors } ) ;`;
export default TestServiceExample;
