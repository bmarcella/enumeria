import  jwt  from 'jsonwebtoken';
import { free, protect } from "../../../common/keycloak/AuthMiddleware";

export const AuthConfig = {
  protect: (roles: string[]) => {
    return protect(roles,  process.env.JWT_PUBLIC_KEY!, jwt);
  },
  free: () => {
    return free( process.env.JWT_PUBLIC_KEY!, jwt);
  }
}