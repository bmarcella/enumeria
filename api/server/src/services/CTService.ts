/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Request,
  Response,
} from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { servicesApp } from '../../../../common/index/Frontend';
import { GenToken, secretKeyCommon } from '../../../../common/keycloak/AuthMiddleware';
import { CrossToken } from '../entity/CrossToken';
import { KcUser } from '../entity/KC_User';
import { User } from '../entity/User';
import { KCToken } from './UserService';
export const monkata_auth_url = "auth";
export const secretKey = secretKeyCommon;
const services = {
  addCT: async (req: Request, res: Response) => {
    try {
      const path = req.body?.path;
      const rep = req.DB.getRepository(CrossToken);
      const app = servicesApp[req.params.key];
      if (!app) return res.status(404).send({ message: "Key not found!" });
      const ct = new CrossToken();
      const token = services.generateToken();
      if (!token) return res.status(500).send({ message: "Token empty" });

      ct.token = token;
      ct.appName = app.name;
      ct.returnUrl = path;
      const monkata_auth = servicesApp[monkata_auth_url];
      const cross_token = await rep.save(ct);
      res.send({
        cross_token,
        monkata_auth
      });
    } catch (error) {
      return res.status(500).send(error);
    }

  },
  generateToken: () => {
    const token = jwt.sign({ timestamp: new Date().getTime() }, secretKey);
    return token;
  },
  verifyToken: (token: any) => {
    try {
      const decoded = jwt.verify(token, secretKey);
      return { error: false, decoded};
    } catch (error: any) {
      console.error('Token verification failed:', error.message);
      return { error: true};
    }
  },
  getCT: async (req: Request, res: Response) => {
    try {
      const rep = req.DB.getRepository(CrossToken);
      const token = req.params.token;
      const vtk = services.verifyToken(token);
      if (vtk.error) return res.status(500).send({ message: "Token invalid", token });
      const ck = await rep.findOne({
        where: { token }
      });
      if (!ck) return res.status(500).send({ message: "Token not exist" , token});
      return res.send({
        cross_token: ck
      });

    } catch (error) {
      return res.status(500).send(error);
    }

  },
  setCToken: async (ck:CrossToken , token: any, req: Request, kcToken: KCToken, tp: number = 1) => {
    if (token) {
      const rep = req.DB.getRepository(CrossToken);
      if (ck) {
        ck.kCToken = JSON.stringify(kcToken);
        ck.type_login = tp;
        await rep.save(ck);
        const app = servicesApp[ck.appName];
        console.log(app);
        return app;
      }
    }
    return false;
  },
  setRefreshTokenCT: async (req: Request, res: Response) => {
    try {
     const ctoken: any = req.body.ctoken;
     const kcToken: any = req.body.kCToken;
      const rep = req.DB.getRepository(CrossToken);
      const id = ctoken.id;
      const ck: CrossToken = await rep.findOne({
        where: { id }
      });

     if (!ck) return res.status(500).send({ message: "Token not exist" });

     const app = await services.setCToken(ck, ctoken.token, req, kcToken);
      return res.status(200).send({app, ck });
    } catch (error) {
      return res.status(500).send(error);
    }

  },
  getFullCT: async (req: Request, res: Response) => {
    try {
      const rep = req.DB.getRepository(CrossToken);
      const token = req.params.token;
      const vtk = services.verifyToken(token);

      if (vtk.error) return res.status(500).send({ message: "Token invalid", token });
      const ck: CrossToken = await rep.findOne({
        where: { token }
      });

      if (!ck) return res.status(500).send({ message: "Token not exist" , token});

      const userRepository = req.DB.getRepository(User);
      const keycloakId = ck.userId;
      const profil = await userRepository.findOne({
        where: { keycloakId }
      });
      
      return res.send({
        cross_token: ck,
        profil
      });

    } catch (error) {
      return res.status(500).send(error);
    }

  },
  getKCToken: async (user: KcUser )  => {
    const  PUBLIC_KEY  = process.env.PUBLIC_KEY;
    const payload = {
      sub: user.sub,
      given_name: user.given_name,
      family_name: user.family_name,
      email: user.email,
    };
    const at = GenToken(jwt, payload, PUBLIC_KEY + "", "24h");
    const rt = GenToken(jwt, payload, PUBLIC_KEY + "", "18h");
    return  {
      access_token: at,
      expires_in: 86000,
      "not-before-policy": 0,
      refresh_expires_in: 64800,
      refresh_token: rt,
      scope: "profile email",
      session_state: uuidv4(),
      token_type: "Bearer",
    } as KCToken;
  },
  directLoginCT : async(req: Request, res: Response) => {
    const keycloakId = req.payload?.sub;
    const dApp = req.params?.app;
    try {
      const userRepository = req.DB.getRepository(KcUser);
      const user: KcUser = await userRepository.findOne({
        where: { sub: keycloakId }
      });
      if (!user) throw { message: "keycloakId non trouvé" };
        const token = await services.getKCToken(user);
        const rep = req.DB.getRepository(CrossToken);
        const ck : CrossToken = new CrossToken();
        ck.userId = user.sub || "";
        ck.kCToken = JSON.stringify(token);
        ck.type_login = 1;
        const ctoken = services.generateToken();
      if (!token) return res.status(500).send({ message: "Token empty" });
      ck.token = ctoken;
      ck.appName = "console";
      ck.returnUrl = "";
      ck.defaultApp = dApp;
      const cross_token = await rep.save(ck);
      const app = servicesApp[ck.appName];
      return res.send( { cross_token , app} );
    } catch (error: any) {
      console.error('Auth Error but account have been created', error);
      throw error;
    }
  }
};
export default services;
