import { _SPS_ } from "../routes/ServiceProvider";
import { DambaRoute } from "./route/DambaRoute";
import { ServiceRegistry } from "./service/DambaService";

export const DambaServices = () => {
    const registry = ServiceRegistry._init().get();
    console.log(registry);
    return DambaRoute(_SPS_);

}