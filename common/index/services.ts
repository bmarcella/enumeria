export type Service = { name: string, path: string, frontend_prod?: string, frontend_dev?: string };
export type ServiceObj = { [key: string]: Service };
export const services: Service[] = [
  {
    name: "users",
    path: "/users",
    frontend_dev: 'https://localhost:4203',
    frontend_prod: 'https:auth.monkata.com'
  },
  {
    name: "memploi",
    path: "/jobs",
    frontend_dev: "https://localhost:4201",
    frontend_prod: 'https://memploi.com'
  },
  {
    name: "admin",
    path: "/users",
    frontend_dev: "https://localhost:4201",
    frontend_prod: 'https://memploi.com'
  },
  {
    name: "pledika",
    path: "/pledika",
    frontend_dev: "https://localhost:4208",
    frontend_prod: 'https://pledika.com'
  },
  {
    name: "console",
    path: "/users",
    frontend_dev: "https://localhost:4207",
    frontend_prod: 'https://console.monkata.com'
  },
];
export const ReCaptchaPublicKey = '6LcthfgpAAAAAHffOi3dMqD4ses5xCGIDA98HRUv';
export const getService = (name: string): Service => {
  const s: ServiceObj = {};
  services.forEach(element => {
    s[element.name] = element;
  });
  return s[name];
}

