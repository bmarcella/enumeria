import 'reflect-metadata';

/* eslint-disable @typescript-eslint/no-explicit-any */
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, {
  Express,
  NextFunction,
  Request,
  Response,
} from 'express';
import session from 'express-session';
import nodemailer from 'nodemailer';
import { DataSource } from 'typeorm';

import { corsOptions } from '../../common/cors/index';
import { AppDataSource } from '../../common/db/data-source';
import { JwtPayload } from '../../common/keycloak/AuthMiddleware';
import { Mail } from '../../common/mail/index';
import { Test } from './entity/Test';
import { routes } from './routes';
import OpenAI from 'openai';

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
    }
  }
}

dotenv.config();

const entities = [Test];
console .log(process.env);
AppDataSource<DataSource, Array<any>>(DataSource, process.env, entities).then((DB: DataSource) => {
  const app: Express = express();
  app.use(cors(corsOptions));

  app.use(session({
    secret: (process.env.SESSION_SECRET + "")?.trim(),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettez à `true` dans un environnement de production avec HTTPS
  }));


  app.use((req: Request, res: Response, next: NextFunction) => {
    req.DB = DB;
    req.AI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY + "" });
    req.mail = new Mail(nodemailer, "memploi", "Mab@0828@2024;");
    next();
  })
  // body-parser
  app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  const BP = (process.env.BASE_PATH) ? process.env.BASE_PATH + '' : '/';
  app.use(BP, routes);

  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`[server]: Server ${process.env.SERVICE_NAME} is running at http://localhost:${port}`);
  });

})
  .catch((error: any) => console.log(error));



