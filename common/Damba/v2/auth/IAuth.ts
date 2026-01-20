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