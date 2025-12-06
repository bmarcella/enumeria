
import { DEvent } from '../service/DEvent';
import { ErrorMessage } from '../../../error/error';
export const secretKeyCommon = '08V5J1vven';
export interface JwtPayload {
  "exp": number,
  "iat": number,
  "auth_time": number,
  "jti": string,
  "iss": string,
  "aud": string,
  "sub": string,
  "typ": string,
  "azp": string,
  "nonce": string,
  "session_state": string,
  "acr": "1",
  "allowed-origins": [],
  "realm_access": {
    "roles": []
  },
  "resource_access": {
    "account": {
      "roles": []
    }
  },
  "scope": string,
  "sid": string,
  "email_verified": boolean,
  "name": string,
  "preferred_username": string,
  "given_name": string,
  "family_name": string,
  "email": string
}

const CheckTokenForDamba = (jwt: any, token: string, key: string): any => {
  try {
    const payload = getPayload(jwt, token, key);
    return { payload, valid: true };
  } catch (error) {
    return false;
  }
}

const CheckTokenForGoogle = async (req: any, token: string): Promise<any> => {
  const check = async () => {
    try {
      const payload = await req.oauth2Google.getTokenInfo(token);
      return { payload, valid: true };
    } catch (err) {
      return false;
    }
  };
  return await check();
}

const getTokenFromHeader = (req: any): string | null => {
  try {
    let token = req?.headers.Authorization?.split(' ')[1];
    if (!token) {
      token = req?.headers.authorization?.split(' ')[1];
      if (!token) return '';
    }
    return token;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const getTokenInfo = (token: string): string[] => {
  try {
    return token.split('|');
  } catch (error) {
    return []
  }
}

export const protect = <T extends DEvent>(roles: string[], public_key: string, jwt?: any, frontent_strategie = 'localstorage') => {

  return async (e: T) => {
    const req = e.in;
    const res = e.out;
    const next = e.go;
    try {
      const token = getTokenFromHeader(req);
      if (!token) return res.sendStatus(402).send({ error: ErrorMessage.NO_TOKEN });
      req.token = token;

      const info = getTokenInfo(token); // info[0] = strategie, info[1] = token, info[2] = google token

      if (info.length < 2) return res.sendStatus(402).send({ error: ErrorMessage.INVALID_TOKEN });
      // // if no session user, the strategie is the first part of the token
      // // if session user, the strategie is the one saved in session
      const strategie = (frontent_strategie == "localstorage" || !req.session.user?.loginStragtegy) ? info[0] : req.session.user?.loginStragtegy;

      if (!strategie) return res.sendStatus(404).send(ErrorMessage.LOGIN_STRATEGIE_NOT_FOUND);
      let payload = undefined;

      payload = CheckTokenForDamba(jwt, info[1], public_key).payload;
      if (!payload) return res.sendStatus(401).send(ErrorMessage.INVALID_LOCAL_TOKEN);

      e.in.payload = payload;
      let gpayload = undefined;

      if (strategie && strategie === 'google' && info[2]) {
        const data = await CheckTokenForGoogle(req, info[2]);
        gpayload = data.payload;
        if (!gpayload) return res.sendStatus(401).send(ErrorMessage.INVALID_GOOGLE_TOKEN);
      }

      if (roles.length == 0) next()
      if (payload.authority.length == 0 || !roles.some(r => payload.authority.includes(r))) {
        return res.sendStatus(401).send(ErrorMessage.NOT_ATHORIZED);
      }
      next();
    } catch (err: any) {
      console.log(err);
      if (err instanceof jwt.TokenExpiredError) {
        return res.sendStatus(403).send(ErrorMessage.TOKEN_EXPIRED);
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.sendStatus(401).send(ErrorMessage.INVALID_TOKEN);
      } else {
        return res.sendStatus(401).send(ErrorMessage.INTERNAL_SERVER_ERROR);
      }
    }
  };
};

export const free = <T extends DEvent>(public_key: string, jwt: any,) => {
  return (e: T) => {
    const req = e.in;
    const next = e.go;
    try {
      let token = typeof req?.headers.Authorization === 'string' ? req.headers.Authorization.split(' ')[1] : undefined;
      if (!token) token = typeof req?.headers.authorization === 'string' ? req.headers.authorization.split(' ')[1] : undefined;

      if (token) {
        const info = getTokenInfo(token); // info[0] = strategie, info[1] = token, info[2] = google token
        req.token = info[1];
        e.in.payload = getPayload(jwt, token, public_key);
      }
      next();
    } catch (err: any) {
      next();
    }
  };
};

export const getPayload = (jwt: any, token: string, PK: string): JwtPayload | any => {
  return jwt.verify(token, PK);
}

export const GenTokenJwt = (jwt: any, payload: any, PK: string, ex: string = (3600 * 24 * 31).toString()): string => {
  return jwt.sign(payload, PK, { expiresIn: ex });
}

export const VerifyRefreshToken = (jwt: any, token: string, PK: string) => {
  try {
    if (!token) {
      return { error: true, message: 'Access Denied: No token provided.' }
    }
    const payload = getPayload(jwt, token, PK + "");
    return { error: false, data: payload };
  } catch (err: any) {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
      return { error: true, message: 'Access Denied: Token has expired.' };
    } else if (err instanceof jwt.JsonWebTokenError) {
      return { error: true, message: 'Access Denied: Invalid token.' };
    } else {
      return { error: true, message: `Access Denied: ${err.message}` };
    }
  }
}

