const testExtraExample = `
import { DambaApi, DExtrasHandler, DExtrasHandlerFactory } from "@Damba/v2/service/DambaService";

export const testExtra : DExtrasHandlerFactory = ( api?: DambaApi) : DExtrasHandler=> {
    return {
        // Define extra methods or properties here
        extraMethod() {
            // Return the value of the 'param' parameter
            return api?.params().param;
        }
    }
}`;
export default testExtraExample;
