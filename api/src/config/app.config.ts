/* eslint-disable @typescript-eslint/no-explicit-any */
// config/app-config.ts
import dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import OpenAI from 'openai';
import { OAuth2Client } from 'google-auth-library';
import type { ExtrasMap } from '@Damba/v1/service/IServiceDamba';
import { DambaRepository } from '@Damba/v2/dao';
import { DambaGoogleAuth } from '@Damba/v1/auth/DambaGoogleAuth';
import { extrasToJSON } from '@Damba/v1/Extras';
import {
  parseBoolean,
  SameSiteOption,
  mustEnv,
  AppShutdownParams,
} from '@Damba/v1/config/ConfigHelper';
import { IAppConfig } from '@Damba/v1/config/IAppConfig';
import { Mail } from '@Damba/v2/mail';
import { Server } from 'http';
import { DambaTypeOrm } from '@Damba/v2/dao/DambaDb';
import { DataSource } from 'typeorm';

import { DEvent } from '@App/damba.import';
import { authorize } from '@Damba/v1/auth/AuthMiddleware';
import jwt from 'jsonwebtoken';
import { DBConfig } from './db';
import { ChatOllama } from '@langchain/ollama';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const SESSION_SECRET = (process.env.SESSION_SECRET ?? '').trim();
if (!SESSION_SECRET) {
  console.warn('SESSION_SECRET is empty. Set it in your environment.');
}

const SESSION_COOKIES_SECURE = parseBoolean(process.env.SESSION_COOKIES_SECURE, isProd);

const SESSION_SAMESITE = (process.env.SESSION_SAMESITE ?? 'lax').toLowerCase() as SameSiteOption;

export const AppConfig: IAppConfig<DataSource> = {
  cors: {
    allowedOrigins: ['http://localhost:5174/'],
    corsOptions: {
      checkOrigin: (origin: any, callback: any) => {
        if (!origin || AppConfig.cors?.allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          if (Number(process.env.DEV + '') == 0) callback(null, true);
          else callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  },
  path: {
    basic: process.env.BASE_PATH ? String(process.env.BASE_PATH) : '/',
    docs: {
      extras: '/damba/doc/extras',
      api: '/damba/doc/api',
    },
    cicd: {
      health: '/damba/cicd/health',
      ready: '/damba/cicd/ready',
    },
  },
  port: String(process.env.PORT ?? '3000'),
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
    secret: mustEnv('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: SESSION_SAMESITE,
      secure: SESSION_COOKIES_SECURE,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  },
  call: {
    helper: (DB: DataSource, extras: ExtrasMap) => {
      const DRepo = DambaRepository.init(DB);
      const aiApiKey = mustEnv('OPENAI_API_KEY');
      const AI = new OpenAI({ apiKey: aiApiKey });
      const smtpUser = mustEnv('SMTP_USER');
      const smtpPass = mustEnv('SMTP_PASSWORD'); // <-- add this env var (or rename to your existing one)
      const mail = new Mail(nodemailer, smtpUser, smtpPass);
      const googleAuth = DambaGoogleAuth.init<OAuth2Client>(OAuth2Client, {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      });
      const oauth2Google = googleAuth.getAuth;
      const ollama = new ChatOllama({
        temperature: 0,
        model: 'gemma3:4b',
      });
      return (req: Request, _res: Response, next: NextFunction) => {
        req.extras = extras;
        req.DRepository = DRepo;
        req.AI = AI;
        req.mail = mail;
        req.oauth2Google = oauth2Google;
        req.ollama = ollama;
        next();
      };
    },
    launch: () => {
      console.log(
        `[server]: Server ${process.env.APP_NAME} is running at http://localhost:${AppConfig.port}`,
      );
    },
    extrasDoc: (extras: any) => (req: Request, res: Response) => {
      res.send(extrasToJSON(extras));
    },
    apiDoc: (doc: any) => (req: Request, res: Response) => {
      res.send(doc);
    },
    shutdown: async (params: AppShutdownParams<Server, DambaTypeOrm<DataSource>>) => {
      await new Promise<void>((resolve) => {
        if (params?.server) params.server.close(() => resolve());
        else resolve();
      });
      if (params?.orm) await params.orm.shutdown(params.name);
      process.exit(0);
    },
    ready: () => (req: Request, res: Response) => {
      res.status(200).json({ ok: true });
    },
    health: () => (req: Request, res: Response) => {
      const ready = true;
      res.status(ready ? 200 : 503).json({ ready });
    },
  },
  authoriztion: {
    strategy: 'localstorage',
    check: (roles?: string[]) => {
      return authorize<DEvent>(
        mustEnv('JWT_PUBLIC_KEY'),
        jwt,
        roles,
        AppConfig.authoriztion.strategy,
      );
    },
  },
  typeOrmDatabaseConfig: DBConfig,
} as const;
