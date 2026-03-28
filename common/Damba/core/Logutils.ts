const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
export const logOk = (msg: string) => console.info(`${GREEN}${msg}${RESET}`);
export const logWarn = (msg: string) => console.warn(`${YELLOW}${msg}${RESET}`);
export const logErr = (msg: string, err?: unknown) =>
  console.error(`${RED}${msg}${RESET}`, err ?? "");
