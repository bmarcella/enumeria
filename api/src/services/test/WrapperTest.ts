
import { BehaviorsChainLooper, createDambaService, DambaService } from "@Damba/v2/service/DambaService";
import { reactAgentSimpleSearchBehavior } from "../Damba/behaviors/ReactAgent";
import { Http } from "@Damba/v2/service/IServiceDamba";

const service = {
    name : "/builder",
} as DambaService

const behaviors: BehaviorsChainLooper = {
  "/react-agent-simple-search" : {
      method: Http.GET,
      behavior: reactAgentSimpleSearchBehavior
  }
};

export default  createDambaService( { service, behaviors } ) ;



