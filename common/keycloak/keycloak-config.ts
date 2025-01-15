

export const ConfigKeycloak = (p: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { PUBLIC_KEY, KEYCLOAK_SECRET, KEYCLOAK_RESOURCE, KEYCLOAK_CONFIDENTIAL_PORT, KEYCLOAK_REALM, KEYCLOAK_AUTH_SERVER_URL, KEYCLOAK_SSL_REQUIRED } = p;
  const keycloakConfig = {
        'confidential-port': Number(KEYCLOAK_CONFIDENTIAL_PORT) || 0,
        'bearer-only': true,
         realm:  KEYCLOAK_REALM+"",
        'auth-server-url':KEYCLOAK_AUTH_SERVER_URL+"",
        'ssl-required':KEYCLOAK_SSL_REQUIRED+"",
        resource:KEYCLOAK_RESOURCE+"",
        "secret": KEYCLOAK_SECRET+"",
        realmPublicKey: PUBLIC_KEY+"",
  } ;
  // as KeycloakConnect.KeycloakConfig ;
  return keycloakConfig;
}

class KeycloakApp<KCC> {

  private kc: KCC;

  private static me: any;

  private static KcT: new (...args: any[]) => any;

  constructor(keycloakConfig: any, session:  any){
   const sess = new session.MemoryStore() 
   const k = new KeycloakApp.KcT({ store: sess }, keycloakConfig) as KCC;
   this.kc = k;
  }

  public static getInstance <KC> (DT: new (...args: any[]) => any, p?: any, session?: any): KeycloakApp<KC> {
       
    if (KeycloakApp.me == undefined) {
        KeycloakApp.KcT = DT;
        KeycloakApp.me = new KeycloakApp<KC>(ConfigKeycloak(p), session);
    }
    return KeycloakApp.me;
  }

  public getKC() : KCC {
    return this.kc;
  }

}

export default KeycloakApp;

