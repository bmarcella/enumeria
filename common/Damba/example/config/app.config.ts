const appConfigExample = `
# Application Configuration Example
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { IAppConfig } from '@Damba/v2/config/IAppConfig';
import { Mail } from '@Damba/v2/mail';
import { Server } from 'http';
import { DambaTypeOrm } from '@Damba/v2/dao/DambaDb';
import { DataSource } from 'typeorm';

import { DEvent } from '@App/damba.import';
import { authorize } from '@Damba/v1/auth/AuthMiddleware';
import jwt from 'jsonwebtoken';
import { ChatOllama } from '@langchain/ollama';
import { DBEntities } from './db';
import createWelcomeHandler from '@Damba/v2/welcome';
import { TavilySearch } from '@langchain/tavily';
import { ChatOpenAI } from '@langchain/openai';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const SESSION_SECRET = (process.env.SESSION_SECRET ?? '').trim();
if (!SESSION_SECRET) {
  console.warn('SESSION_SECRET is empty. Set it in your environment.');
}

const SESSION_COOKIES_SECURE = parseBoolean(process.env.SESSION_COOKIES_SECURE, isProd);

const SESSION_SAMESITE = (process.env.SESSION_SAMESITE ?? 'lax').toLowerCase() as SameSiteOption;

export const AppConfig: IAppConfig<DataSource> = {
  appName: process.env.APP_NAME || 'DambaApp',
  description: process.env.APP_DESCRIPTION || 'Damba Application',
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
      const openAi = new ChatOpenAI({
        apiKey: aiApiKey,
        model: "gpt-4o-mini",
        temperature: 0.2,
      });
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
        model: 'qwen2.5-coder:32b-instruct '
      });
      
      const tavily = new TavilySearch({
           maxResults: 5,
           tavilyApiKey: process.env.TAVILY_API_KEY
      });

      return (req: Request, _res: Response, next: NextFunction) => {
        req.extras = extras;
        req.DRepository = DRepo;
        req.openAi = openAi;
        req.mail = mail;
        req.oauth2Google = oauth2Google;
        req.ollama = ollama;
        req.tavily = tavily;
        next();
      };
    },
    launch: () => {
        console.log('App is launching...');
    },
    welcome: createWelcomeHandler,
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
        AppConfig?.authoriztion?.strategy,
      );
    },
  },
  databaseConfig: {
    entities: DBEntities,
    initOrm: async () => {
      const orm = DambaTypeOrm.get(DataSource, process.env as any, DBEntities, {
        retries: 8,
        retryDelayMs: 1000,
        log: console.log,
      });
      const dataSource = (await orm.init()) as DataSource;
      orm.enableProcessSignalHandlers();
      return { orm, dataSource };
    },
  },
  processes: (orm: DambaTypeOrm<DataSource>) => {
    return [
      {
        name: 'SIGTERM',
        error: false,
        withoutError: (server: any) =>
          void AppConfig.call.shutdown?.({
            server: server,
            name: 'SIGTERM',
            orm,
          }),
      },
      {
        name: 'SIGINT',
        error: false,
        withoutError: (server: any) =>
          void AppConfig.call.shutdown?.({
            server: server,
            name: 'SIGINT',
            orm,
          }),
      },
      {
        name: 'unhandledRejection',
        error: true,
        withError: (err: any) => {
          console.error('unhandledRejection', err);
          // If you want fail-fast instead of just logging, uncomment:
          // void AppConfig.call.shutdown?.({ server: (Damba.instance as any)?.server, name: "unhandledRejection", orm });
        },
      },
      {
        name: 'uncaughtException',
        error: true,
        withoutError: () => {},
        withError: (err: any, server: any) => {
          console.error('uncaughtException', err);
          void AppConfig.call.shutdown?.({
            server: server,
            name: 'uncaughtException',
            orm,
          });
        },
      },
    ];
  },
} as const;
`;
export default appConfigExample;
