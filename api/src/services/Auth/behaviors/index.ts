// behaviors barrel

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import jwt from 'jsonwebtoken';
import { ErrorMessage } from '../../../../../common/error/error';
import { Request, Response } from 'express';
import { User } from '../../User/entities/User';
import { Organization } from '../../Organization/entities/Organization';
import {  SessionUser } from '../../../../../common/Entity/UserDto';
import { createService, DEvent } from '@App/damba.import';
import { GenTokenJwt } from '@Damba/v1/auth/AuthMiddleware';
import { Role, RoleName } from '@App/services/User/entities/Role';
import { AppConfig } from '@App/config/app';
const auth = AppConfig.authoriztion;
const api = createService('/auth');

api.DPost(
  '/google/exchange',
  async (e: DEvent) => {
    const req = e.in;
    const res = e.out;
    try {
      const { code } = e.in.body as { code: string };
      const { tokens } = await e.in.oauth2Google.getToken({ code });
      if (!tokens.id_token) return e.out.status(400).json({ error: ErrorMessage.NO_ID_TOKEN });
      const ticket = await e.in.oauth2Google.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });
      const payload = ticket.getPayload()!;

      let user: User = (await req.DRepository.DGet(
        User,
        {
          where: {
            email: payload.email!,
          },
          relations: ['authority'], // load related roles
        },
        false,
      )) as User;

      if (user && user?.disabled) {
        return res.status(403).json({ error: ErrorMessage.ACCOUNT_DISABLED });
      }

      if (!user) {
        user = await req.extras?.auth.initiateUser?.(req, payload);
      }

      if (user && user?.googleSub && user?.googleSub !== payload.sub) {
        return res.status(403).json({ error: ErrorMessage.NOT_ATHORIZED });
      }

      if (user && !user?.googleSub) {
        user.googleSub = payload.sub!;
        user = await req.extras?.auth.SaveUser(req, user);
      }

      if (!user) return res.status(401).json({ error: ErrorMessage.USER_NOT_FOUND });
      // Regenerate session to prevent fixation
      req.session.regenerate((err) => {
        if (err) return res.status(500).json({ error: ErrorMessage.SESSION_ERROR });

        const auth = user.authority?.map((r) => {
          return r.name;
        });
        const userDTO = {
          ...user,
          authority: auth,
          organizations: user.organizations,
          currentSetting: user.currentSetting,
        };
        req.session.user = req.extras?.auth.toSessionUser(user, 'google');
        const dToken = GenTokenJwt(jwt, userDTO, process.env.JWT_PUBLIC_KEY!);
        req.session.tokens = {
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token!,
          id_token: tokens.id_token!,
          expiry_date: tokens.expiry_date!,
          scope: tokens.scope,
        };

        req.session.save(() =>
          res.status(200).json({
            user: userDTO,
            tokens: {
              access_token: `google|${dToken}|${tokens.access_token}`,
              refresh_token: tokens.refresh_token!,
              expiry_date: tokens.expiry_date,
              scope: tokens.scope,
            },
          }),
        );
      });
    } catch (e) {
      console.error(e);
      res.status(401).json({ error: ErrorMessage.EXCHANGE_TOKEN_FAILED });
    }
  },
  {
    toSessionUser(user: User, strategy: any): SessionUser {
      if (!user) throw new Error('Invalid user entity');
      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        firstName: user.firstName!,
        lastName: user.lastName!,
        picture: user.picture ?? null,
        googleSub: user.googleSub ?? null,
        issuer: user.issuer!,
        loginStragtegy: strategy!,
        audience: user.audience!,
        currentSetting: user?.currentSetting,
        disabled: user.disabled ?? false,
        // Extract role names safely (avoid circular refs)
        authority: Array.isArray(user.authority) ? user.authority.map((role) => role.name) : [],
      };
    },
    saveUser: async (req: Request, user: User): Promise<User> => {
      return (await req.DRepository.DSave(User, user)) as unknown as Promise<User>;
    },
    initiateUser: async (req: Request, payload: any): Promise<any> => {
      let new_role: Role = (await req.DRepository.DGet(
        Role,
        {
          where: {
            name: RoleName.USER,
          },
        },
        false,
      )) as Role;

      if (!new_role) {
        // Create default role and organization for new user
        new_role = (await req.DRepository.DSave(Role, {
          name: RoleName.USER,
          description: 'Default role for new user',
        } as Role)) as Role;
      }

      const new_user = (await req.DRepository.DSave(User, {
        googleSub: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        issuer: payload.iss,
        audience: payload.aud,
        authority: [new_role],
        disabled: false,
      } as User)) as User;

      const new_org = (await req.DRepository.DSave(Organization, {
        user: new_user,
      } as Organization)) as Organization;

      new_user.currentSetting = { orgId: new_org.id! };
      new_user.organizations = [new_org];
      (await req.DRepository.DSave(User, new_user)) as User;

      return await req.DRepository.DGet(User, {
        where: {
          email: payload.email!,
        },
        relations: ['authority'], // load related roles
      });
    },
  },
);

api.DGet('/test', (e: DEvent) => {
  const req = e.in as Request;
  const res = e.out as Response;
  res.send(req);
});

api.DGet('/logout', (e: DEvent) => {
  const req = e.in as Request;
  const res = e.out as Response;
  req.session.destroy(() => res.clearCookie('connect.sid').sendStatus(204));
});

api.DGet('/refreshToken', async (e: DEvent) => {
  const req = e.in as Request;
  const res = e.out as Response;
  try {
    const rt = req.session.tokens?.refresh_token;
    if (!rt) return res.status(400).json({ error: ErrorMessage.REFRESH_TOKEN_MISSING });
    const { credentials } = await req.oauth2Google.refreshToken(rt);
    // Update access token/expiry in session
    req.session.tokens = {
      ...req.session.tokens,
      access_token: credentials.access_token ?? req.session.tokens?.access_token,
      expiry_date: credentials.expiry_date ?? req.session.tokens?.expiry_date,
      id_token: credentials.id_token ?? req.session.tokens?.id_token,
      scope: credentials.scope ?? req.session.tokens?.scope,
    };
    req.session.save(() => res.sendStatus(204));
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: ErrorMessage.REFRESH_TOKEN_FAILED });
  }
});

api.DPost(
  '/meta',
  async (e: DEvent) => {
    const data = e.in.body;
    const id = e.in.payload?.id;
    if (!id)
      return e.out.status(500).send({ message: ErrorMessage.NOT_FOUND, entity: 'MetaConfig' });
    const conf = await e.in.extras.auth.setCurrentSetting(e, id, data);
    return e.out.json(conf);
  },
  {
    setCurrentSetting: async (e: DEvent, id, data: any) => {
      return await e.in.DRepository.DUpdate(
        User,
        {
          id,
        },
        {
          currentSetting: data,
        },
      );
    },
  },
  [auth.check(['user'])],
);
export default api.done();
