/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAppConfig } from "./../config/IAppConfig";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WelcomeCard {
  title: string;
  content?: string;
  links?: { label: string; href: string }[];
  badge?: string;
}

export interface WelcomeTheme {
  primary: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  font: string;
}

export interface WelcomeOptions {
  /** Override the app name displayed in header */
  title?: string;
  /** Subtitle / tagline below the header */
  subtitle?: string;
  /** Additional cards to render on the page */
  cards?: WelcomeCard[];
  /** Theme overrides */
  theme?: Partial<WelcomeTheme>;
  /** Extra nav links shown in the header */
  navLinks?: { label: string; href: string }[];
  /** Footer text (supports HTML) */
  footer?: string;
  /** If true, skip the default Docs and Health cards */
  hideDefaults?: boolean;
  /** Extra JSON fields merged into the JSON response */
  extraJson?: Record<string, any>;
}

// ─── Defaults ───────────────────────────────────────────────────────────────
const defaultTheme: WelcomeTheme = {
  primary: "#fb732c",
  bg: "#fafafa",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#1f2937",
  muted: "#6b7280",
  font: "ui-sans-serif, system-ui, -apple-system, sans-serif",
};

// ─── HTML Builder ───────────────────────────────────────────────────────────

const renderCard = (card: WelcomeCard, theme: WelcomeTheme) => {
  const badge = card.badge ? `<span class="badge">${card.badge}</span>` : "";

  const links = card.links?.length
    ? `<ul>${card.links.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join("")}</ul>`
    : "";

  const content = card.content ? `<p>${card.content}</p>` : "";

  return `
    <div class="card">
      <h3>${card.title} ${badge}</h3>
      ${content}
      ${links}
    </div>`;
};

const renderNav = (links: { label: string; href: string }[]) =>
  links.length
    ? `<nav>${links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}</nav>`
    : "";

const renderHtml = (
  appName: string,
  version: string | number,
  theme: WelcomeTheme,
  nav: string,
  cards: string,
  footer: string,
  subtitle: string,
) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${appName}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${theme.font};background:${theme.bg};color:${theme.text};line-height:1.6}
    .container{max-width:960px;margin:0 auto;padding:24px 16px}
    header{border-bottom:1px solid ${theme.border};padding-bottom:16px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
    header .title-group{display:flex;flex-direction:column}
    header h1{font-size:1.5rem;font-weight:700}
    header .subtitle{color:${theme.muted};font-size:0.9rem;margin-top:2px}
    header .meta{display:flex;gap:8px;align-items:center;font-size:0.8rem;color:${theme.muted}}
    header .meta .version{background:${theme.primary};color:#fff;padding:2px 8px;border-radius:9999px;font-weight:600}
    nav{display:flex;gap:12px;flex-wrap:wrap}
    nav a{color:${theme.primary};text-decoration:none;font-weight:500;font-size:0.9rem}
    nav a:hover{text-decoration:underline}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
    .card{background:${theme.surface};border:1px solid ${theme.border};border-radius:12px;padding:20px}
    .card h3{font-size:1rem;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:8px}
    .card p{color:${theme.muted};font-size:0.9rem;margin-bottom:8px}
    .card ul{list-style:none;display:flex;flex-direction:column;gap:4px}
    .card ul li a{color:${theme.primary};text-decoration:none;font-size:0.9rem}
    .card ul li a:hover{text-decoration:underline}
    .badge{background:${theme.primary}18;color:${theme.primary};font-size:0.75rem;padding:2px 8px;border-radius:9999px;font-weight:600}
    footer{border-top:1px solid ${theme.border};margin-top:32px;padding-top:16px;color:${theme.muted};font-size:0.8rem;text-align:center}
    footer a{color:${theme.primary};text-decoration:none}
    @media(max-width:600px){.grid{grid-template-columns:1fr}header{flex-direction:column;align-items:flex-start}}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="title-group">
        <h1>${appName}</h1>
        ${subtitle ? `<span class="subtitle">${subtitle}</span>` : ""}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
        <div class="meta">
          <span class="version">v${version}</span>
          <span>${new Date().toISOString().split("T")[0]}</span>
        </div>
        ${nav}
      </div>
    </header>
    <div class="grid">
      ${cards}
    </div>
    ${footer ? `<footer>${footer}</footer>` : ""}
  </div>
</body>
</html>`;

// ─── Factory ────────────────────────────────────────────────────────────────

export const createWelcomeHandler = (
  opts: IAppConfig,
  welcomeOpts: WelcomeOptions = {},
) => {
  const appName =
    welcomeOpts.title ?? opts?.appName ?? process.env.APP_NAME ?? "Damba API";
  const version = String(opts?.version ?? process.env.APP_VERSION ?? "1");
  const subtitle = welcomeOpts.subtitle ?? opts?.description ?? "";
  const theme: WelcomeTheme = { ...defaultTheme, ...welcomeOpts.theme };

  const apiDocPath = opts?.path?.docs?.api ?? "/damba/doc/api";
  const extrasDocPath = opts?.path?.docs?.extras ?? "/damba/doc/extras";
  const healthPath = opts?.path?.cicd?.health ?? "/health";
  const readyPath = opts?.path?.cicd?.ready ?? "/ready";

  // Build default cards
  const defaultCards: WelcomeCard[] = welcomeOpts.hideDefaults
    ? []
    : [
        {
          title: "Documentation",
          badge: "docs",
          links: [
            { label: "API Routes", href: apiDocPath },
            { label: "Extras", href: extrasDocPath },
          ],
        },
        {
          title: "Health & Readiness",
          badge: "ops",
          links: [
            { label: `Health — ${healthPath}`, href: healthPath },
            { label: `Ready — ${readyPath}`, href: readyPath },
          ],
        },
      ];

  const allCards = [...defaultCards, ...(welcomeOpts.cards ?? [])];
  const navLinks = welcomeOpts.navLinks ?? [];
  const footerText = welcomeOpts.footer ?? `Powered by <a href="#">Damba</a>`;

  return (req: any, res: any) => {
    const accept = String(req.headers?.accept ?? "");

    if (accept.includes("text/html")) {
      const cardsHtml = allCards.map((c) => renderCard(c, theme)).join("");
      const navHtml = renderNav(navLinks);
      const html = renderHtml(
        appName,
        version,
        theme,
        navHtml,
        cardsHtml,
        footerText,
        subtitle,
      );
      return res.status(200).type("html").send(html);
    }

    return res.status(200).json({
      name: appName,
      version,
      description: subtitle || undefined,
      docs: { api: apiDocPath, extras: extrasDocPath },
      health: { health: healthPath, ready: readyPath },
      timestamp: new Date().toISOString(),
      ...(welcomeOpts.extraJson ?? {}),
    });
  };
};
export default createWelcomeHandler;
