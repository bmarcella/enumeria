/* eslint-disable @typescript-eslint/no-namespace */
import { SessionUser } from '../../common/Entity/UserDto';
import 'reflect-metadata';
import 'tsconfig-paths/register';
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // init DB before listening (fail fast)
  const DS = await orm.init();
  orm.enableProcessSignalHandlers();

  const app = express();
  app.use(cors(AppConfig.cors?.corsOptions));
  app.use(bodyParser.json(AppConfig.json));
  app.use(bodyParser.urlencoded(AppConfig.urlencoded));
  app.use(session(AppConfig.session));
  const { route, extras, doc } = DambaServices(_SPS_, AppConfig);

  app.use(AppConfig.call.helper!(DS, extras));

  if (AppConfig.path.docs?.extras)
    app.use(AppConfig.path.docs?.extras, AppConfig.call.extrasDoc!(extras));

  if (AppConfig.path.docs?.api) app.use(AppConfig.path.docs?.api, AppConfig.call.apiDoc!(doc));

  app.use(AppConfig.path.basic, route);

  const server = app.listen(AppConfig.port, AppConfig.call.launch);

  process.once('SIGTERM', () => void AppConfig.call.shutdown!({ server, name: 'SIGTERM', orm }));
  process.once('SIGINT', () => void AppConfig.call.shutdown!({ server, name: 'SIGINT', orm }));

  // Avoid silent crashes
  process.on('unhandledRejection', (err) => {
    console.error('unhandledRejection', err);
  });

  process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
    void AppConfig.call.shutdown!({ server, name: 'uncaughtException', orm });
  });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
