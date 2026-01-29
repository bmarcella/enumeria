
import { BehaviorsChainLooper, createDambaService, DambaService } from "@Damba/v2/service/DambaService";
import { Http } from "@Damba/v2/service/IServiceDamba";
import { addChatBehavior } from "./behaviors";



const service = {
    name : "/ai",
} as DambaService

const behaviors: BehaviorsChainLooper = {
     "/chat" : {
      method: Http.POST,
      behavior: addChatBehavior,
  }
};

export default  createDambaService( { service, behaviors } ) ;