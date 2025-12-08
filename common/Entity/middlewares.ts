export interface Middleware {
  id?: string;
  name: string;
  description: string;
  behaviors?: any[];
  policies?: any[];
}
