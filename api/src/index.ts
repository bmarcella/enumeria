/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SessionUser } from '../../common/Damba/v2/Entity/UserDto';
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
import { ExtrasMap } from '@Damba/v1/route/DambaRoute';
import { DambaRepository } from '@Damba/v2/dao';
import { Mail } from '@Damba/v2/mail';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearch } from '@langchain/tavily';
import Damba from '@Damba/v2';
import IORedis from 'ioredis';
import { _SPS_AGENT_MODULE_ } from './AgentModule';
import { _SPS_INDEX_ } from './services';

declare global {
  namespace Express {
    interface Request {
      EurekaClient?: any;
      payload?: JwtPayload;
      token?: string;
      mail: Mail;
      openAi: ChatOpenAI;
      oauth2Google: OAuth2Client | any;
      DRepository: DambaRepository<DataSource>;
      extras: ExtrasMap;
      data: any;
      ollama: ChatOllama;
      tavily: TavilySearch;
      redis: IORedis;
      retrieverTool: any;
      qdrantRetriever: any;
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

const _SPS_ = { ..._SPS_INDEX_, ..._SPS_AGENT_MODULE_ };
async function main() {
  dotenv.config();
  try {
    Damba.start({
      _SPS_,
      AppConfig,
      express,
      cors,
      bodyParser,
      session,
      queue: {
        tenant: 'x-tenant',
        correlation: 'x-correlation-id',
      },
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
