
import { ErrorMessage } from './../error/error';
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
  try {
    const payload = await req.oauth2Google.getTokenInfo(token);
    return { payload, valid: true };
  } catch (err) {
    return false;
  }
}

const getTokenFromHeader = (req: any): string | null => {
  try {
    let token = req?.headers.Authorization?.split(' ')[1];
    if (!token) {
      token = req?.headers.authorization?.split(' ')[1];
      if (!token) return null;
    }
    return token;
  } catch (error) {
    return null;
  }
}

export const protect = async (jwt: any, p: any, roles?: string[]) => {
  return async (req: any, res: any, next: any) => {
    try {
      const token = getTokenFromHeader(req);
      if (!token) return res.status(401).send(ErrorMessage.NO_TOKEN);
      req.token = token;
      const strategie = req.session.user.loginStragtegy;
      let payload = undefined;

      if (strategie === 'local' || !strategie) {
        payload = CheckTokenForDamba(jwt, token, p.PUBLIC_KEY!).payload;
        if (!payload) return res.status(401).send(ErrorMessage.INVALID_LOCAL_TOKEN);
      }

      if (strategie && strategie === 'google') {
        const data = await CheckTokenForGoogle(req, token);
        payload = data.payload;
        if (!payload) return res.status(401).send(ErrorMessage.INVALID_GOOGLE_TOKEN);
      }

      if (!payload) return res.status(401).send(ErrorMessage.INVALID_TOKEN)
      if (roles && (!req.session.user || !req.session.user.authority || !roles.some(r => req.session.user.authority.includes(r)))) {
        return res.status(403).send(ErrorMessage.NOT_ATHORIZED);
      }
      next();
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(403).send(ErrorMessage.TOKEN_EXPIRED);
      } else if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).send(ErrorMessage.INVALID_TOKEN);
      } else {
        return res.status(401).send(ErrorMessage.INTERNAL_SERVER_ERROR);
      }
    }
  };
};

export const free = (jwt: any, p: any, role?: string) => {
  return (req: any, res: any, next: any) => {
    try {
      let token = req?.headers.Authorization?.split(' ')[1];
      if (!token) token = req?.headers.authorization?.split(' ')[1];
      if (token) {
        req.token = token;
        req.payload = getPayload(jwt, token, p.PUBLIC_KEY!);
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



export const GenToken = (jwt: any, payload: any, PK: string, ex: string): string => {
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

export const protectEnt = (jwt: any, p: any, role?: string) => {
  return (req: any, res: any, next: any) => {
    try {
      let token = req?.headers.Enttoken;
      if (!token) {
        token = req?.headers.enttoken;
        if (!token) return res.status().send('Access Denied: No token provided.');
      }
      req.tokenEnt = token;
      req.payloadEnt = getPayload(jwt, token, secretKeyCommon);
      if (role && (!req.payload.roles || !req.payload.roles.includes(role))) {
        return res.status(403).send('Access Denied: Insufficient permissions.');
      }
      next();
    } catch (err: any) {
      console.log(err);
      next();
    }
  };
};
