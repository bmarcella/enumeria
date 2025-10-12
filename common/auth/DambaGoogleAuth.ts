/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

export class DambaGoogleAuth<A> {
  private auth: A;
  private static _instance: DambaGoogleAuth<any> | null = null;

  constructor(private T: new (...args: any[]) => A, private p: any) {
    this.auth = new T({
      clientId: p.GOOGLE_CLIENT_ID!,
      clientSecret: p.GOOGLE_CLIENT_SECRET!,
      redirectUri: p.GOOGLE_REDIRECT_URI, // recommended for GIS popup
    });
  }

  /**
   * Initializes (or returns existing) singleton instance of DambaGoogleAuth
   */
  public static init<T>(
    T: new (...args: any[]) => T,
    p: any
  ): DambaGoogleAuth<T> {
    if (!DambaGoogleAuth._instance) {
      DambaGoogleAuth._instance = new DambaGoogleAuth<T>(T, p);
    }
    return DambaGoogleAuth._instance as DambaGoogleAuth<T>;
  }

  /** Returns the underlying auth instance */
  public get getAuth(): A {
    return this.auth;
  }
}
