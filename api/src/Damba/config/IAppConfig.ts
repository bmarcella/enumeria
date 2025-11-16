/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';


// --- Types externes personnalisés --- //
interface SessionCookieConfig {
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  secure: boolean;
  maxAge: number;
}

interface SessionConfig {
  name: string;
  secret: string;
  resave: boolean;
  saveUninitialized: boolean;
  cookie: SessionCookieConfig;
}

interface JsonConfig {
  limit: string;
  type: 'application/json';
}

interface UrlEncodedConfig {
  limit: string;
  extended: boolean;
}

// --- Définition de l'interface principale --- //
export interface IAppConfig {
  base_path: string;
  port: string;
  logRoute: boolean;
  version: number;

  json: JsonConfig;
  urlencoded: UrlEncodedConfig;
  session: SessionConfig;

  helper: <T>(DB: T, extras: any) => (req: Request, res: Response, next: NextFunction) => void;
  launch: () => void;
}
