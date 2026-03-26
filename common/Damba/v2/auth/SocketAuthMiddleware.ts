import { getTokenInfo, CheckTokenForDamba } from "./AuthMiddleware";

const CheckTokenForGoogleSocket = async (socket: any, token: string): Promise<any> => {
  try {
    const payload = await socket.data.oauth2Google.getTokenInfo(token);
    return { payload, valid: true };
  } catch {
    return false;
  }
};

export const authorizeSocket = (
  public_key: string,
  jwt?: any,
  roles?: string[],
) => {
  if (!jwt) throw new Error("Jwt is undefied");
  return protectSocket(public_key, jwt, roles );
};

const protectSocket = (
  public_key: string,
  jwt: any, 
  roles?: string[],
) => {
 console.log("Protect socket");
  return async <S extends object = any>(socket: S & { data: { token: string, user: any, googleUser: any }}, data?: any) : Promise<S | undefined> => {
    try {
      const token = socket.data.token  || data?.token;
      if (!token) {
         return  undefined;
      }
      const info = getTokenInfo(token); 
      if (info.length < 2) {
          return undefined;
      }
      const strategie = info[0]
      if (!strategie) {
         return undefined;
      }
      // Local token check
      const dambaCheck = CheckTokenForDamba(jwt, info[1], public_key);
      const payload = dambaCheck?.payload;
      if (!payload) {
        return undefined;
      }
      socket.data.user = payload;
      // Optional google token check
      if (strategie === "google" && info[2]) {
          const data = await CheckTokenForGoogleSocket(socket, info[2]);
          const gpayload = data?.payload;
          if (!gpayload) {
            return undefined;
          }
        socket.data.googleUser = gpayload;
      }

      // Role check
      if (!roles || roles.length === 0) {
          return socket; 
      }

      const authority: string[] = Array.isArray(payload?.authority) ? payload.authority : [];
      const allowed = roles.some((r) => authority.includes(r));
      if (allowed) {
          return socket;
      }
      return undefined;
    } catch (err: any) {
       return  undefined;
    }
  };
};