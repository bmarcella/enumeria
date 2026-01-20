/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SessionUser } from '../../common/Entity/UserDto';
import 'reflect-metadata';
import 'tsconfig-paths/register';

import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { DataSource } from 'typeorm';

import { AppConfig } from './config/app.config';
import { OAuth2Client } from 'google-auth-library';
import { JwtPayload } from 'jsonwebtoken';
import OpenAI from 'openai';

import { _SPS_ } from './services';
import { DambaServices } from './damba.import';

import { ExtrasMap } from '@Damba/v1/route/DambaRoute';
import { DambaRepository } from '@Damba/v2/dao';
import { DambaTypeOrm } from '@Damba/v2/dao/DambaDb';
import { Mail } from '@Damba/v2/mail';
import { ChatOllama } from '@langchain/ollama';
import Damba from '@Damba/index';

declare global {
  namespace Express {
    interface Request {
      EurekaClient?: any;
      payload?: JwtPayload;
      token?: string;
      mail: Mail;
      AI: OpenAI;
      oauth2Google: OAuth2Client | any;
      DRepository: DambaRepository<DataSource>;
      extras: ExtrasMap;
      data: any;
      ollama: ChatOllama;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
    tokens?: {
      access_token?: string;
      refresh_token?: string;
      id_token?: string;
      expiry_date?: number;
      scope?: string;
    };
  }
}

async function main() {
  dotenv.config();

  // --- ORM init (fail fast BEFORE starting server) ---
  const orm = DambaTypeOrm.get(
    DataSource,
    process.env as any,
    AppConfig.typeOrmDatabaseConfig!.entities,
    {
      retries: 8,
      retryDelayMs: 1000,
      log: console.log,
    },
  );

  const DS = await orm.init();
  orm.enableProcessSignalHandlers();

  // Build services (route/extras/doc) before boot
  const { route, extras, doc } = DambaServices(_SPS_, AppConfig);

  // ✅ Start with YOUR Damba class (which creates DambaApp internally)
  Damba.start({
    datasource: DS,
    _SPS_,
    AppConfig,
    // injected deps (your DambaApp expects these names)
    express,
    cors,
    bodyParser,
    session,

    // app-specific pieces
    route,
    extras,
    doc,
    orm,

    // process handlers (wired only after server starts, per your DambaApp)
    processes: [
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
      // Avoid silent crashes (log; optionally shutdown)
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
    ],
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
