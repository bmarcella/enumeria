/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DambaRepository } from '../dao';
import type { ExtrasMap } from '../route/IRoute';
import type { JwtPayload } from '../auth/IAuth';

/**
 * Damba Express Request augmentation.
 *
 * These properties are injected onto every request by the
 * AppConfig.call.helper middleware. Projects using Damba
 * get these types automatically.
 */
declare global {
  namespace Express {
    interface Request {
      /** JWT payload set by auth middleware */
      payload?: JwtPayload;
      /** Raw auth token string */
      token?: string;
      /** Damba repository (TypeORM wrapper) */
      DRepository: DambaRepository<any>;
      /** Service extras (helper functions) */
      extras: ExtrasMap;
      /** Per-request data bag (set by behaviors/middleware) */
      data: Record<string, any>;
      /** Redis client */
      redis?: any;
      /** Google OAuth2 client */
      oauth2Google?: any;
      /** Nodemailer transporter */
      mail?: Mail;
  
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      loginStrategy?: string;
    };
    tokens?: {
      access_token?: string;
      refresh_token?: string;
      id_token?: string;
      expiry_date?: number;
      scope?: string;
    };
  }
}
