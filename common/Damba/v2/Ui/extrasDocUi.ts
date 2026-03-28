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

  return `
    <div class="fn-row">
      <div class="fn-main">
        ${asyncBadge}
        <code class="fn-name">${name}</code>
        <span class="fn-params">(${params})</span>
      </div>
    </div>`;
};

const renderGroup = (
  groupName: string,
  functions: Record<string, any>,
  theme: DambaTheme,
) => {
  const fnEntries = Object.entries(functions);
  const count = fnEntries.length;

  const fnsHtml = fnEntries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, sig]) => renderFunction(name, sig, theme))
    .join("");

  return `
    <div class="group-card">
      <div class="group-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="group-title">
          <span class="chevron">&#9660;</span>
          <h3>${groupName}</h3>
          <span class="fn-count">${count} function${count !== 1 ? "s" : ""}</span>
        </div>
      </div>
      <div class="group-functions">
        ${fnsHtml}
      </div>
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
  extras: Record<string, Record<string, any>>,
  theme?: Partial<DambaTheme>,
) => {
  const t: DambaTheme = { ...defaultTheme, ...theme };
  const appName = appConfig?.appName ?? "Damba API";

  // Compute stats
  let totalFunctions = 0;
  let totalGroups = 0;

  for (const [, fns] of Object.entries(extras)) {
    totalGroups++;
    totalFunctions += Object.keys(fns).length;
  }

  return (_req: any, res: any) => {
    const statsHtml = `
      <div class="stats">
        <div class="stat"><div class="num">${totalGroups}</div><div class="label">Services</div></div>
        <div class="stat"><div class="num">${totalFunctions}</div><div class="label">Functions</div></div>
      </div>`;

    const groupsHtml = Object.entries(extras)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, fns]) => renderGroup(name, fns, t))
      .join("");

    const body = `
      <div class="page-header">
        <h1>${appName} — Extras</h1>
        <div class="meta">${totalFunctions} functions across ${totalGroups} services</div>
      </div>
      <input type="text" class="search-bar" placeholder="Search functions... (e.g. formatPrice)" id="search"/>
      ${statsHtml}
      <div id="groups">
        ${groupsHtml || '<div class="empty">No extras registered.</div>'}
      </div>
      <script>
        document.getElementById('search').addEventListener('input', function(e) {
          const q = e.target.value.toLowerCase();
          document.querySelectorAll('.group-card').forEach(function(card) {
            const rows = card.querySelectorAll('.fn-row');
            let visible = 0;
            rows.forEach(function(row) {
              const text = row.textContent.toLowerCase();
              const show = !q || text.includes(q);
              row.style.display = show ? '' : 'none';
              if (show) visible++;
            });
            card.style.display = visible > 0 || !q ? '' : 'none';
            if (q && visible > 0) card.classList.remove('collapsed');
          });
        });
      </script>`;

    const html = layoutShell(`${appName} — Extras`, t, body, extrasStyles(t));
    return res.status(200).type("html").send(html);
  };
};