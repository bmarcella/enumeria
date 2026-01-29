import { DambaApi, DExtrasHandler, DExtrasHandlerFactory } from "@Damba/v2/service/DambaService";

export const reactAgentSimpleSearchBehaviorExtras : DExtrasHandlerFactory = ( api?: DambaApi) : DExtrasHandler=> {
    return {
        getQuery() {
            return api?.params().query;
        }
    }
    
}