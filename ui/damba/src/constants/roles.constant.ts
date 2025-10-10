/* eslint-disable @typescript-eslint/no-explicit-any */
import { USER_ROLES } from "@/views/shared/schema"

export const ADMIN = 'admin'
export const ASSIST_ACCOUNTANT = 'assist_accoutant'
export const ACCOUNTANT = 'accoutant'
export const SUPER_MANAGER = 'super_manager'
export const AGENT_IMMOBILLIER= 'agent_immobilier'
export const COORDONATOR = 'coordonator'
export const ASSIST_COORDONATOR = 'assist_coordonator'
export const MANAGER = 'manager'
export const ASSIST_MANAGER = 'assist_manager'
export const PROPRIETOR = 'proprietor'
export const OPERATION = 'operation'
export const VENDOR_MANAGEMENT = 'vendor_management'
export const FIELDS_OPS = 'fields_ops'
export const VENDOR = 'vendeur'
export const PROPRIETARY = 'proprietaire'
export const REFERENCE = 'reference'



 export const manageAuth = async (auth : string, proprio: any, t : any )=> {
    // let regions : any[] = Regions;
    // if (auth !== "admin") {
    //     regions  = getRegionsByValues(proprio?.regions || []);
    // }
    // const xroles = getRolesByAhth(auth);
    // const roles = await convertStringToSelectOptions([...xroles], t, "roles");
    // return { regions , roles }
    return {}
  }

export const getRolesByAhth = (auth: string ) => {
     let roles: any [] = [ "proprietaire", "reference"];
       auth = auth.toLowerCase().trim();
        switch (auth) {
           case "admin":
               roles  = [...USER_ROLES];
              break;
          case "coordonator":
            roles = roles.concat(["agent_immobilier","assist_coordonator"])
            break;
          case "assist_coordonator":
            roles.push("agent_immobilier");
            break;
      
          case "manager":
            roles = roles.concat(["agent_immobilier","assist_manager", "assist_coordonator", "coordonator"]);
            break;
      
          case "assist_manager":
            roles = roles.concat(["agent_immobilier", "assist_coordonator", "coordonator"]);
            break;
      
          case "operation":
            roles = roles.concat(["agent_immobilier","vendeur"]);
            break;
          case "vendor_management":
            roles = roles.concat(["vendeur"]);
          break;
          case "super_manager":
            roles = roles.concat(["vendeur","agent_immobilier","assist_manager", "assist_coordonator", "coordonator"]);  
         break;
         case "accoutant":
          roles = roles.concat(["vendeur", "assist_accoutant"]);  
          break;
          default:
            roles  = ["proprietaire", "reference"];
          break;
        }
        return roles;
}
