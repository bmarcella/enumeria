import { SessionUser } from './../../common/Entity/UserDto';
import 'reflect-metadata';
/* eslint-disable @typescript-eslint/no-explicit-any */
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, {
  Express,
} from 'express';
import session from 'express-session';
import { DataSource } from 'typeorm';
import { corsOptions } from '../../common/cors/index';
import { AppDataSource } from '../../common/db/data-source';
import { AppConfig } from './config/app';
import { DBConfig } from './config/db';
import { OAuth2Client } from 'google-auth-library';
import { JwtPayload } from 'jsonwebtoken';
import OpenAI from 'openai';
import { Mail } from '../../common/mail';
import { DambaRepository } from '../../common/mvc/CrudService';
import { DambaServices } from './Damba/Index';

dotenv.config();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      EurekaClient?: any,
      payload?: JwtPayload,
      token?: string
      DB: any,
      mail: Mail,
      AI: OpenAI
      oauth2Google: OAuth2Client | any,
      DRepository: DambaRepository<DataSource>,
      extras?: Record<string, (...args: any[]) => any>
    }
  }
}

declare module "express-session" {
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

AppDataSource<DataSource, Array<any>>(DataSource, process.env, DBConfig.entities).then((DB: DataSource) => {
  const app: Express = express();
  app.use(cors(corsOptions));
  // body-parser
  app.use(bodyParser.json(AppConfig.json));
  app.use(bodyParser.urlencoded(AppConfig.urlencoded));
  app.use(session(AppConfig.session));
  app.use(AppConfig.helper<DataSource>(DB))
  app.use(AppConfig.base_path, DambaServices());
  app.listen(AppConfig.port, () => {
    console.log(`[server]: Server ${process.env.APP_NAME} is running at http://localhost:${AppConfig.port}`);
  });

})
  .catch((error: any) => console.log(error));




