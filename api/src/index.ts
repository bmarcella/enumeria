import { SessionUser } from '../../common/Entity/UserDto';
import 'reflect-metadata';
import 'tsconfig-paths/register';
/* eslint-disable @typescript-eslint/no-explicit-any */
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, {
  Express,
} from 'express';
import session from 'express-session';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../common/db/data-source';
import { AppConfig } from './config/app';
import { DBConfig } from './config/db';
import { OAuth2Client } from 'google-auth-library';
import { JwtPayload } from 'jsonwebtoken';
import OpenAI from 'openai';
import { Mail } from '../../common/mail';
import { DambaRepository } from '../../common/mvc/CrudService';
import { DambaServices } from './Damba/Index';
import { ExtrasMap } from './Damba/service/DambaService';
import { _SPS_ } from './services';
import { corsConfig } from 'config/cors';
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
      extras: ExtrasMap,
      data: any;
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
  app.use(cors(corsConfig.corsOptions));
  // body-parser
  app.use(bodyParser.json(AppConfig.json));
  app.use(bodyParser.urlencoded(AppConfig.urlencoded));
  app.use(session(AppConfig.session));
  const {route , extras } = DambaServices(_SPS_, AppConfig);
  app.use(AppConfig.helper<DataSource>(DB, extras))
  app.use(AppConfig.base_path, route);
  app.listen(AppConfig.port, AppConfig.launch );

}).catch((error: any) => console.log(error));




