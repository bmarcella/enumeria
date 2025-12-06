import { DEvent } from '@App/damba.import';
import { free, protect } from '@Damba/v1/auth/AuthMiddleware';
import jwt from 'jsonwebtoken';


export const AuthConfig = {
  protect: (roles: string[]) => {
    return protect<DEvent>(roles, process.env.JWT_PUBLIC_KEY!, jwt);
  },
  free: () => {
    return free<DEvent>(process.env.JWT_PUBLIC_KEY!, jwt);
  }
}