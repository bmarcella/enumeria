/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAppConfig } from "../config/IAppConfig";
import { DambaTheme, defaultTheme, layoutShell } from "./theme";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getParamList(fn: Function): string {
  const src = fn.toString().trim();
  const match =
    src.match(/^[\s\S]*?\(([^)]*)\)/) ||
    src.match(/^[\s\S]*?([a-zA-Z0-9_]+)\s*=>/) ||
    null;
  if (!match) return "";
  return (match[1] ?? "")
    .replace(/=>/, "")
    .replace(/[()]/g, "")
    .trim();
}

// ─── Render Helpers ─────────────────────────────────────────────────────────

const renderFunction = (name: string, value: any, _theme: DambaTheme) => {
  let isAsync = false;
  let params = "";

  if (typeof value === "function") {
    isAsync = value.constructor?.name === "AsyncFunction";
    params = getParamList(value);
  } else if (typeof value === "string") {
    isAsync = value.includes("[AsyncFunction");
    const paramsMatch = value.match(/\(([^)]*)\)/);
    params = paramsMatch ? paramsMatch[1] : "";
  }

  const asyncBadge = isAsync
    ? `<span class="badge" style="background:#dbeafe;color:#1d4ed8">async</span>`
    : `<span class="badge" style="background:#f3f4f6;color:#374151">sync</span>`;

  return `<div class="fn-row"><div class="fn-main">${asyncBadge}<code class="fn-name">${name}</code><span class="fn-params">(${params})</span></div></div>`;
};

const renderService = (
  serviceName: string,
  functions: Record<string, any>,
  theme: DambaTheme,
) => {
  const fnEntries = Object.entries(functions);
  const count = fnEntries.length;
  const fnsHtml = fnEntries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, val]) => renderFunction(name, val, theme))
    .join("");

  return `<div class="group-card">
      <div class="group-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="group-title"><span class="chevron">&#9660;</span><h3>${serviceName}</h3><span class="fn-count">${count} fn${count !== 1 ? "s" : ""}</span></div>
      </div>
      <div class="group-functions">${fnsHtml}</div>
    </div>`;
};

const renderModule = (
  moduleName: string,
  services: Record<string, Record<string, any>>,
  theme: DambaTheme,
) => {
  const serviceEntries = Object.entries(services);
  const totalFns = serviceEntries.reduce((sum, [, fns]) => sum + Object.keys(fns).length, 0);

  const servicesHtml = serviceEntries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, fns]) => renderService(name, fns, theme))
    .join("");

  return `<div class="module-section">
      <div class="module-header" onclick="this.parentElement.classList.toggle('mod-collapsed')">
        <div class="module-title">
          <span class="module-chevron">&#9660;</span>
          <h2>${moduleName}</h2>
          <span class="module-count">${serviceEntries.length} service${serviceEntries.length !== 1 ? "s" : ""} · ${totalFns} fn${totalFns !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div class="module-body">${servicesHtml}</div>
    </div>`;
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const extrasStyles = (theme: DambaTheme) => `
    .search-bar{width:100%;padding:10px 14px;border:1px solid ${theme.border};border-radius:8px;font-size:0.9rem;margin-bottom:20px;outline:none;transition:border-color .15s}
    .search-bar:focus{border-color:${theme.primary}}
    .stats{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}
    .stat{background:${theme.surface};border:1px solid ${theme.border};border-radius:8px;padding:12px 16px;min-width:120px}
    .stat .num{font-size:1.4rem;font-weight:700;color:${theme.primary}}
    .stat .label{font-size:0.75rem;color:${theme.muted};text-transform:uppercase;letter-spacing:0.05em}
    .module-section{margin-bottom:24px}
    .module-section.mod-collapsed .module-body{display:none}
    .module-section.mod-collapsed .module-chevron{transform:rotate(-90deg)}
    .module-header{padding:12px 0;cursor:pointer;user-select:none;border-bottom:2px solid ${theme.primary}30}
    .module-title{display:flex;align-items:center;gap:10px}
    .module-title h2{font-size:1.1rem;font-weight:700;color:${theme.primary}}
    .module-chevron{font-size:0.8rem;color:${theme.primary};transition:transform .15s}
    .module-count{font-size:0.75rem;color:${theme.muted};background:${theme.bg};padding:2px 10px;border-radius:9999px}
    .module-body{padding-top:12px}
    .group-card{background:${theme.surface};border:1px solid ${theme.border};border-radius:12px;margin-bottom:12px;overflow:hidden}
    .group-card.collapsed .group-functions{display:none}
    .group-card.collapsed .chevron{transform:rotate(-90deg)}
    .group-header{padding:14px 18px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;user-select:none;transition:background .1s}
    .group-header:hover{background:${theme.bg}}
    .group-title{display:flex;align-items:center;gap:8px}
    .group-title h3{font-size:0.95rem;font-weight:600}
    .chevron{font-size:0.7rem;color:${theme.muted};transition:transform .15s}
    .fn-count{font-size:0.75rem;color:${theme.muted};background:${theme.bg};padding:2px 8px;border-radius:9999px}
    .group-functions{border-top:1px solid ${theme.border}}
    .fn-row{padding:10px 18px;border-bottom:1px solid ${theme.border};display:flex;flex-direction:column;gap:4px}
    .fn-row:last-child{border-bottom:none}
    .fn-main{display:flex;align-items:center;gap:10px}
    .fn-name{font-size:0.85rem;font-weight:600}
    .fn-params{font-size:0.8rem;color:${theme.muted};font-family:monospace}
    .empty{text-align:center;padding:40px;color:${theme.muted}}
    @media(max-width:600px){.group-header{flex-direction:column;align-items:flex-start}.stats{flex-direction:column}}
`;

// ─── Factory ────────────────────────────────────────────────────────────────

export const createExtrasDocUi = (
  appConfig: IAppConfig,
  modularExtras: Record<string, Record<string, Record<string, any>>>,
  theme?: Partial<DambaTheme>,
) => {
  const t: DambaTheme = { ...defaultTheme, ...theme };
  const appName = appConfig?.appName ?? "Damba API";

  // Compute stats
  let totalFunctions = 0;
  let totalServices = 0;
  const moduleEntries = Object.entries(modularExtras);

  for (const [, services] of moduleEntries) {
    for (const [, fns] of Object.entries(services)) {
      totalServices++;
      totalFunctions += Object.keys(fns).length;
    }
  }

  return (_req: any, res: any) => {
    const statsHtml = `
      <div class="stats">
        <div class="stat"><div class="num">${moduleEntries.length}</div><div class="label">Modules</div></div>
        <div class="stat"><div class="num">${totalServices}</div><div class="label">Services</div></div>
        <div class="stat"><div class="num">${totalFunctions}</div><div class="label">Functions</div></div>
      </div>`;

    const modulesHtml = moduleEntries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([modName, services]) => renderModule(modName, services, t))
      .join("");

    const body = `
      <div class="page-header">
        <h1>${appName} — Extras</h1>
        <div class="meta">${totalFunctions} functions across ${totalServices} services in ${moduleEntries.length} modules</div>
      </div>
      <input type="text" class="search-bar" placeholder="Search functions... (e.g. formatPrice)" id="search"/>
      ${statsHtml}
      <div id="modules">
        ${modulesHtml || '<div class="empty">No extras registered.</div>'}
      </div>
      <script>
        document.getElementById('search').addEventListener('input', function(e) {
          var q = e.target.value.toLowerCase();
          document.querySelectorAll('.module-section').forEach(function(modEl) {
            var cards = modEl.querySelectorAll('.group-card');
            var modVisible = 0;
            cards.forEach(function(card) {
              var rows = card.querySelectorAll('.fn-row');
              var visible = 0;
              rows.forEach(function(row) {
                var text = row.textContent.toLowerCase();
                var show = !q || text.includes(q);
                row.style.display = show ? '' : 'none';
                if (show) visible++;
              });
              card.style.display = visible > 0 || !q ? '' : 'none';
              if (q && visible > 0) card.classList.remove('collapsed');
              if (visible > 0) modVisible++;
            });
            modEl.style.display = modVisible > 0 || !q ? '' : 'none';
            if (q && modVisible > 0) modEl.classList.remove('mod-collapsed');
          });
        });
      </script>`;

    const html = layoutShell(`${appName} — Extras`, t, body, extrasStyles(t));
    return res.status(200).type("html").send(html);
  };
};
