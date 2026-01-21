import { IAppConfig } from "./config/IAppConfig";

// welcome.ts
export const createWelcomeHandler =
  (opts: IAppConfig) => (req: any, res: any) => {
    const appName = opts?.appName ?? process.env.APP_NAME ?? "Damba API";
    const version = opts?.version ?? process.env.APP_VERSION ?? "v1";
    const apiDocPath = opts?.path.docs.api ?? "/damba/doc/api";
    const extrasDocPath = opts?.path.docs.extras ?? "/damba/doc/extras";
    // If browser requests HTML, return a simple landing page
    const accept = String(req.headers?.accept ?? "");
    if (accept.includes("text/html")) {
      return res.status(200).type("html").send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${appName}</title>
    <style>
      body{font-family:ui-sans-serif,system-ui;max-width:900px;margin:40px auto;padding:0 16px;line-height:1.5}
      .card{border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin:12px 0}
      code{background:#f3f4f6;padding:2px 6px;border-radius:6px}
      a{color:#fb732c;text-decoration:none}
      a:hover{text-decoration:underline}
      .muted{color:#6b7280}
    </style>
  </head>
  <body>
    <h1>Welcome to ${appName}  API 🚀</h1>
    <p class="muted">Running • ${new Date().toISOString()} • version <b>${version}</b></p>
    <div class="card">
      <h3>Docs</h3>
      <ul>
        <li><a href="${apiDocPath}">API Docs</a></li>
        <li><a href="${extrasDocPath}">Extras Docs</a></li>
      </ul>
    </div>
    <div class="card">
      <h3>Health</h3>
      <p>Try: <code>/health</code></p>
    </div>
  </body>
</html>
      `);
    }

    // Default JSON
    return res.status(200).json({
      name: appName,
      message: "Welcome to Damba API 🚀",
      version,
      docs: { api: apiDocPath, extras: extrasDocPath },
      endpoints: { health: "/health" },
      timestamp: new Date().toISOString(),
    });
  };
export default createWelcomeHandler;
