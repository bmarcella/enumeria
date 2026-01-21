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
  try {
    if (!AppConfig.databaseConfig || !AppConfig.databaseConfig.initOrm) {
      throw new Error('TypeOrmDatabaseConfig is not defined in AppConfig');
    }
    const { orm, dataSource } = await AppConfig.databaseConfig.initOrm();
    const { route, extras, doc } = DambaServices(_SPS_, AppConfig);

    Damba.start({
      datasource: dataSource,
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
      processes: AppConfig?.processes ? AppConfig?.processes(orm) : [],
    });
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
