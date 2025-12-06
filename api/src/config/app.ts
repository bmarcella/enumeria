
/* eslint-disable @typescript-eslint/no-explicit-any */
// config/app-config.ts
import dotenv from 'dotenv';
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import nodemailer from 'nodemailer';

import OpenAI from 'openai';
import { Mail } from '../../../common/mail';
import { OAuth2Client } from 'google-auth-library';
import { ExtrasMap } from '@Damba/v1/service/IServiceDamba';
import { DambaRepository } from '@Damba/v1/mvc/CrudService';
import { DambaGoogleAuth } from '@Damba/v1/auth/DambaGoogleAuth';
import { extrasToJSON } from '@Damba/v1/Extras';

dotenv.config();

type SameSiteOption = 'lax' | 'strict' | 'none';

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value == null) return fallback;
  const v = value.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

const isProd = process.env.NODE_ENV === 'production';

const SESSION_SECRET =
  (process.env.SESSION_SECRET ?? '').trim();

if (!SESSION_SECRET) {
  // Fail fast in dev; in prod you might want to throw instead.
  console.warn('SESSION_SECRET is empty. Set it in your environment.');
}

const SESSION_COOKIES_SECURE =
  parseBoolean(process.env.SESSION_COOKIES_SECURE, isProd);

const SESSION_SAMESITE =
  ((process.env.SESSION_SAMESITE ?? 'lax').toLowerCase() as SameSiteOption);

/**
 * Express / body-parser / express-session config
 */
export const AppConfig = {
  extras_path: "/extras",
  base_path: (process.env.BASE_PATH) ? process.env.BASE_PATH!.toString() : '/',
  port: process.env.PORT!.toString(),
  logRoute: true,
  version: 1,
  json: {
    limit: '50mb',
    type: 'application/json' as const,
  },
  urlencoded: {
    limit: '50mb',
    extended: true,
  },
  session: {
    name: 'sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: SESSION_SAMESITE, // 'lax' | 'strict' | 'none'
      secure: SESSION_COOKIES_SECURE, // true in prod by default
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
  helper: <T>(DB: T, extras: ExtrasMap) => {
    return (req: Request, res: Response, next: NextFunction) => {
      req.extras = extras;
      req.DB = DB;
      req.DRepository = DambaRepository.init(DB) as any;
      req.AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY!.toString() });
      req.mail = new Mail(nodemailer, process.env.SMTP_USER!.toString(), process.env!.toString());
      const googleAuth = DambaGoogleAuth.init<OAuth2Client>(OAuth2Client, {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      });
      req.oauth2Google = googleAuth.getAuth;
      next();
    }
  },
  launch: () => {
    console.log(`[server]: Server ${process.env.APP_NAME} is running at http://localhost:${AppConfig.port}`);
  },
  extrasDoc: (extras: any) => {
    return (res: Response) => {
      res.send(extrasToJSON(extras));
    }
  }
} as const;
