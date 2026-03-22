import { DEvent } from "../service/DEvent";
import { ErrorMessage } from "../../../error/error";
import { JwtPayload } from "./IAuth";

export const secretKeyCommon = "08V5J1vven";

const CheckTokenForDamba = (jwt: any, token: string, key: string): any => {
  try {
    const payload = getPayload(jwt, token, key);
    return { payload, valid: true };
  } catch {
    return false;
  }
};

const CheckTokenForGoogle = async (req: any, token: string): Promise<any> => {
  try {
    const payload = await req.oauth2Google.getTokenInfo(token);
    return { payload, valid: true };
  } catch {
    return false;
  }
};

const getTokenFromHeader = (req: any): string | null => {
  try {
    // NOTE: Node lowercases headers, so "authorization" is the main one
    const h = req?.headers?.authorization ?? req?.headers?.Authorization;
    if (!h) return null;

    const token = String(h).split(" ")[1];
    return token || null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getTokenInfo = (token: string): string[] => {
  try {
    return token.split("|");
  } catch {
    return [];
  }
};

export const authorize = <T extends DEvent>(
  public_key: string,
  jwt?: any,
  roles?: string[],
  frontent_strategie = "localstorage"
) => {
  if (jwt) return protect<T>(public_key, jwt, frontent_strategie, roles);
  throw new Error("Jwt is undefied");
};

const protect = <T extends DEvent>(
  public_key: string,
  jwt: any,
  frontent_strategie: string,
  roles?: string[]
) => {
  return async (e: T) => {
    const req: any = e.in;
    const res: any = e.out;

    try {
      const token = getTokenFromHeader(req);
      if (!token) {
        return res.status(401).send({ error: ErrorMessage.NO_TOKEN.toString() });
      }

      req.token = token;

      const info = getTokenInfo(token); // [strategie|token|googleToken?]
      if (info.length < 2) {
        return res.status(401).send({ error: ErrorMessage.INVALID_TOKEN });
      }

      const strategie =
        frontent_strategie === "localstorage" || !req.session?.user?.loginStragtegy
          ? info[0]
          : req.session.user.loginStragtegy;

      if (!strategie) {
        return res.status(400).send({ error: ErrorMessage.LOGIN_STRATEGIE_NOT_FOUND });
      }

      // Local token check
      const dambaCheck = CheckTokenForDamba(jwt, info[1], public_key);
      const payload = dambaCheck?.payload;
      if (!payload) {
        return res.status(401).send({ error: ErrorMessage.INVALID_LOCAL_TOKEN });
      }

      req.payload = payload; // or e.in.payload = payload

      // Optional google token check
      if (strategie === "google" && info[2]) {
        const data = await CheckTokenForGoogle(req, info[2]);
        const gpayload = data?.payload;
        if (!gpayload) {
          return res.status(401).send({ error: ErrorMessage.INVALID_GOOGLE_TOKEN });
        }
        req.gpayload = gpayload;
      }

      if (!roles || roles.length === 0) {
        return e.go(); 
      }

      const authority: string[] = Array.isArray(payload?.authority) ? payload.authority : [];
      const allowed = roles.some((r) => authority.includes(r));

      if (allowed) {
        return e.go();
      }

      return res.status(403).send({ error: ErrorMessage.NOT_ATHORIZED });
    } catch (err: any) {
      console.log(err);

      if (err instanceof jwt.TokenExpiredError) {
        return res.status(403).send({ error: ErrorMessage.TOKEN_EXPIRED });
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).send({ error: ErrorMessage.INVALID_TOKEN });
      }
      return res.status(500).send({ error: ErrorMessage.INTERNAL_SERVER_ERROR });
    }
  };
};

export const getPayload = (jwt: any, token: string, PK: string): JwtPayload | any => {
  return jwt.verify(token, PK);
};

export const GenTokenJwt = (
  jwt: any,
  payload: any,
  PK: string,
  ex: string = (3600 * 24 * 31).toString()
): string => {
  return jwt.sign(payload, PK, { expiresIn: ex });
};

export const VerifyRefreshToken = (jwt: any, token: string, PK: string) => {
  try {
    if (!token) {
      return { error: true, message: "Access Denied: No token provided." };
    }
    const payload = getPayload(jwt, token, PK + "");
    return { error: false, data: payload };
  } catch (err: any) {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
      return { error: true, message: "Access Denied: Token has expired." };
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return { error: true, message: "Access Denied: Invalid token." };
    }
    return { error: true, message: `Access Denied: ${err.message}` };
  }
};
