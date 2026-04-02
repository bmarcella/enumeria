/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// config/app-config.ts
import dotenv from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { ExtrasMap } from '@Damba/v2/route/IRoute';
import { DambaRepository } from '@Damba/v2/dao';
import { extrasToJSON } from '@Damba/v2/Extras';
import {
  parseBoolean,
  SameSiteOption,
  mustEnv,
  AppShutdownParams,
} from '@Damba/v2/config/ConfigHelper';
import { IAppConfig } from '@Damba/v2/config/IAppConfig';
import { Mail } from '@Damba/v2/mail';
import { Server } from 'http';
import { DambaTypeOrm } from '@Damba/v2/dao/DambaDb';
import { DataSource } from 'typeorm';
import { authorize } from '@Damba/v2/auth/AuthMiddleware';
import jwt from 'jsonwebtoken';
import { ChatOllama } from '@langchain/ollama';
import { TavilySearch } from '@langchain/tavily';
import { ChatOpenAI } from '@langchain/openai';
import { socketConfig } from './SocketConfig';
import { QueueConfig } from './QueueConfig';
import { oauth2Google } from './google.auth';
import { authorizeSocket } from '@Damba/v2/auth/SocketAuthMiddleware';
import { DEvent } from '@Damba/v2/service/DEvent';

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
    helper: (extras: ExtrasMap, DB?: DataSource) => {
      const DRepo = DambaRepository.init(DB);

      const aiApiKey = mustEnv('OPENAI_API_KEY');
      const openAi = new ChatOpenAI({
        apiKey: aiApiKey,
        model: 'gpt-4o-mini',
        temperature: 0.2,
      });
      const ollama = new ChatOllama({
        temperature: 0,
        model: 'qwen2.5-coder:32b-instruct',
      });

      const tavily = new TavilySearch({
        maxResults: 5,
        tavilyApiKey: process.env.TAVILY_API_KEY,
      });
      return (req: Request, _res: Response, next: NextFunction) => {
        req.extras = extras;
        req.DRepository = DRepo;
        req.oauth2Google = oauth2Google;
        req.openAi = openAi;
        req.ollama = ollama;
        req.tavily = tavily;
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
    apiDocUi: {
      isSecure: false,
      path: '/api/docs',
    },
    extrasDocUi: {
      isSecure: false,
      path: '/extras/docs',
    },
  },
  authorization: {
    strategy: 'localstorage',
    check: (roles?: string[]) => {
      return authorize<DEvent>(
        mustEnv('JWT_PUBLIC_KEY'),
        jwt,
        roles,
        AppConfig?.authorization?.strategy,
      );
    },
    socketCheck: (roles?: string[]) => {
      return authorizeSocket(mustEnv('JWT_PUBLIC_KEY'), jwt, roles);
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
  socket: socketConfig,
  queue: QueueConfig,
} as const;
