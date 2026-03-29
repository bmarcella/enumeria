/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAppConfig } from "../config/IAppConfig";
import { ModularApiDoc, ModuleDocEntry, RouteDocEntry, ServiceDoc } from "../route/DambaRouteDoc";
import { DambaTheme, defaultTheme, layoutShell, methodColors } from "./theme";

// ─── Zod Schema Introspection ───────────────────────────────────────────────

interface FieldInfo {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

function extractZodFields(schema: any): FieldInfo[] | null {
  if (!schema) return null;
  const shape = schema?.shape ?? schema?._def?.shape?.();
  if (shape && typeof shape === "object") {
    return Object.entries(shape).map(([name, field]: [string, any]) => ({
      name,
      type: resolveZodType(field),
      required: !isOptional(field),
      description: field?._def?.description,
    }));
  }
  if (schema?._def?.schema) {
    return extractZodFields(schema._def.schema);
  }
  return null;
}

function resolveZodType(field: any): string {
  if (!field?._def) return "unknown";
  const def = field._def;
  const typeName: string = def.typeName ?? "";
  switch (typeName) {
    case "ZodString": return "string";
    case "ZodNumber": return "number";
    case "ZodBoolean": return "boolean";
    case "ZodDate": return "date";
    case "ZodEnum": return `enum(${(def.values ?? []).join(" | ")})`;
    case "ZodNativeEnum": return "enum";
    case "ZodLiteral": return `"${def.value}"`;
    case "ZodArray": return `${resolveZodType(def.type)}[]`;
    case "ZodOptional": return resolveZodType(def.innerType);
    case "ZodNullable": return `${resolveZodType(def.innerType)} | null`;
    case "ZodDefault": return resolveZodType(def.innerType);
    case "ZodObject": return "object";
    case "ZodRecord": return "record";
    case "ZodUnion": return (def.options ?? []).map((o: any) => resolveZodType(o)).join(" | ");
    case "ZodUndefined": return "undefined";
    case "ZodAny": return "any";
    case "ZodEffects": return resolveZodType(def.schema);
    default: return typeName.replace("Zod", "").toLowerCase() || "unknown";
  }
}

function isOptional(field: any): boolean {
  const typeName = field?._def?.typeName ?? "";
  return typeName === "ZodOptional" || typeName === "ZodDefault";
}

// ─── Render Helpers ─────────────────────────────────────────────────────────

const methodBadge = (method: string) => {
  const c = methodColors[method] ?? { bg: "#f3f4f6", text: "#374151" };
  return `<span class="badge" style="background:${c.bg};color:${c.text}">${method}</span>`;
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const renderSchemaTable = (label: string, colorClass: string, fields: FieldInfo[]) => {
  if (!fields.length) return "";
  const rows = fields
    .map((f) => {
      const req = f.required
        ? '<span class="field-req">required</span>'
        : '<span class="field-opt">optional</span>';
      const desc = f.description ? `<span class="field-desc">— ${esc(f.description)}</span>` : "";
      return `<tr><td><code>${esc(f.name)}</code></td><td><code class="field-type">${esc(f.type)}</code></td><td>${req} ${desc}</td></tr>`;
    })
    .join("");
  return `<div class="schema-section"><div class="schema-label ${colorClass}">${label}</div><table class="schema-table"><thead><tr><th>Field</th><th>Type</th><th>Info</th></tr></thead><tbody>${rows}</tbody></table></div>`;
};

const renderRoute = (route: RouteDocEntry, _theme: DambaTheme) => {
  const mwTotal = route.moduleMidlewareCount + route.serviceMiddlewareCount + route.routeMiddlewareCount;
  const timeout = route.timeout
    ? `<span class="tag">timeout: ${route.timeout.in ?? route.timeout.out ?? "?"}ms</span>`
    : "";
  const mwTag = mwTotal > 0 ? `<span class="tag">${mwTotal} mw</span>` : "";
  const desc = route.decription ? `<p class="route-desc">${esc(route.decription)}</p>` : "";

  const paramsFields = extractZodFields(route.validators?.params);
  const queryFields = extractZodFields(route.validators?.query);
  const bodyFields = extractZodFields(route.validators?.body);
  const responseFields = extractZodFields(route.validators?.response?.schema);
  const hasSchema = paramsFields || queryFields || bodyFields || responseFields;

  const schemasHtml = hasSchema
    ? `<div class="route-schemas">
        ${paramsFields ? renderSchemaTable("Params", "label-params", paramsFields) : ""}
        ${queryFields ? renderSchemaTable("Query", "label-query", queryFields) : ""}
        ${bodyFields ? renderSchemaTable("Body", "label-body", bodyFields) : ""}
        ${responseFields ? renderSchemaTable(`Response ${route.validators?.response?.statusCode ?? ""}`, "label-response", responseFields) : ""}
      </div>`
    : "";

  const expandBtn = hasSchema
    ? `<button class="schema-toggle" onclick="this.closest('.route-row').classList.toggle('expanded')">schema</button>`
    : "";

  return `<div class="route-row">
      <div class="route-main">${methodBadge(route.method)}<code class="route-path">${esc(route.fullPath)}</code>${expandBtn}</div>
      ${desc}
      <div class="route-tags">${mwTag}${timeout}
        ${paramsFields ? '<span class="tag tag-params">params</span>' : ""}
        ${queryFields ? '<span class="tag tag-query">query</span>' : ""}
        ${bodyFields ? '<span class="tag tag-body">body</span>' : ""}
        ${!route.hasHandler ? '<span class="tag tag-warn">no handler</span>' : ""}
      </div>
      ${schemasHtml}
    </div>`;
};

const renderService = (mount: string, serviceDoc: ServiceDoc, theme: DambaTheme) => {
  let routeCount = 0;
  let routesHtml = "";
  const order = ["GET", "POST", "PATCH", "PUT", "DELETE"];
  const sorted = Object.entries(serviceDoc).sort(
    ([a], [b]) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)),
  );
  for (const [, paths] of sorted) {
    for (const [, route] of Object.entries(paths)) {
      routesHtml += renderRoute(route, theme);
      routeCount++;
    }
  }
  return `<div class="service-card">
      <div class="service-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <div class="service-title"><span class="chevron">&#9660;</span><h3>${mount}</h3><span class="route-count">${routeCount} route${routeCount !== 1 ? "s" : ""}</span></div>
        <div class="method-summary">${Object.keys(serviceDoc).map((m) => methodBadge(m)).join("")}</div>
      </div>
      <div class="service-routes">${routesHtml}</div>
    </div>`;
};

const renderModule = (mod: ModuleDocEntry, theme: DambaTheme) => {
  const serviceEntries = Object.entries(mod.services);
  const totalRoutes = serviceEntries.reduce((sum, [, svcDoc]) => {
    return sum + Object.values(svcDoc).reduce((s, paths) => s + Object.keys(paths).length, 0);
  }, 0);

  const mwBadge = mod.middlewareCount > 0
    ? `<span class="module-mw-badge">${mod.middlewareCount} module mw</span>`
    : "";

  const servicesHtml = serviceEntries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mount, svcDoc]) => renderService(mount, svcDoc, theme))
    .join("");

  return `<div class="module-section">
      <div class="module-header" onclick="this.parentElement.classList.toggle('mod-collapsed')">
        <div class="module-title">
          <span class="module-chevron">&#9660;</span>
          <h2>${esc(mod.name)}</h2>
          <span class="module-count">${serviceEntries.length} service${serviceEntries.length !== 1 ? "s" : ""} · ${totalRoutes} route${totalRoutes !== 1 ? "s" : ""}</span>
          ${mwBadge}
        </div>
      </div>
      <div class="module-body">${servicesHtml}</div>
    </div>`;
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const apiStyles = (theme: DambaTheme) => `
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
    .module-mw-badge{font-size:0.7rem;color:#7c3aed;background:#ede9fe;padding:2px 8px;border-radius:9999px;font-weight:600}
    .module-body{padding-top:12px}
    .service-card{background:${theme.surface};border:1px solid ${theme.border};border-radius:12px;margin-bottom:12px;overflow:hidden}
    .service-card.collapsed .service-routes{display:none}
    .service-card.collapsed .chevron{transform:rotate(-90deg)}
    .service-header{padding:14px 18px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;user-select:none;transition:background .1s}
    .service-header:hover{background:${theme.bg}}
    .service-title{display:flex;align-items:center;gap:8px}
    .service-title h3{font-size:0.95rem;font-weight:600}
    .chevron{font-size:0.7rem;color:${theme.muted};transition:transform .15s}
    .route-count{font-size:0.75rem;color:${theme.muted};background:${theme.bg};padding:2px 8px;border-radius:9999px}
    .method-summary{display:flex;gap:4px}
    .service-routes{border-top:1px solid ${theme.border}}
    .route-row{padding:10px 18px;border-bottom:1px solid ${theme.border};display:flex;flex-direction:column;gap:4px}
    .route-row:last-child{border-bottom:none}
    .route-main{display:flex;align-items:center;gap:10px}
    .route-path{font-size:0.85rem;font-weight:500}
    .route-desc{font-size:0.8rem;color:${theme.muted};margin-left:4px}
    .route-tags{display:flex;gap:6px;flex-wrap:wrap}
    .tag{font-size:0.7rem;padding:2px 6px;border-radius:4px;background:${theme.bg};color:${theme.muted}}
    .tag-params{background:#ede9fe;color:#7c3aed}
    .tag-query{background:#dbeafe;color:#1d4ed8}
    .tag-body{background:#dcfce7;color:#15803d}
    .tag-warn{background:#fef2f2;color:#dc2626}
    .schema-toggle{border:1px solid ${theme.border};background:${theme.bg};color:${theme.primary};padding:2px 8px;border-radius:4px;font-size:0.7rem;cursor:pointer;font-weight:600;margin-left:auto}
    .schema-toggle:hover{background:${theme.primary};color:#fff}
    .route-schemas{display:none;margin-top:8px;padding-top:8px;border-top:1px dashed ${theme.border}}
    .route-row.expanded .route-schemas{display:block}
    .schema-section{margin-bottom:10px}
    .schema-label{font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px}
    .label-params{background:#ede9fe;color:#7c3aed}
    .label-query{background:#dbeafe;color:#1d4ed8}
    .label-body{background:#dcfce7;color:#15803d}
    .label-response{background:#fef3c7;color:#b45309}
    .schema-table{width:100%;border-collapse:collapse;font-size:0.8rem}
    .schema-table th{text-align:left;font-weight:600;padding:4px 8px;border-bottom:1px solid ${theme.border};color:${theme.muted};font-size:0.7rem;text-transform:uppercase}
    .schema-table td{padding:4px 8px;border-bottom:1px solid ${theme.border}08}
    .schema-table code{font-size:0.8rem}
    .field-type{color:${theme.primary}}
    .field-req{font-size:0.7rem;color:#dc2626;font-weight:500}
    .field-opt{font-size:0.7rem;color:${theme.muted};font-weight:500}
    .field-desc{font-size:0.75rem;color:${theme.muted}}
    .empty{text-align:center;padding:40px;color:${theme.muted}}
    @media(max-width:600px){.service-header{flex-direction:column;align-items:flex-start}.stats{flex-direction:column}}
`;

// ─── Factory ────────────────────────────────────────────────────────────────

export const createApiDocUi = (
  appConfig: IAppConfig,
  doc: ModularApiDoc,
  theme?: Partial<DambaTheme>,
) => {
  const t: DambaTheme = { ...defaultTheme, ...theme };
  const appName = appConfig?.appName ?? "Damba API";

  // Compute stats
  let totalRoutes = 0;
  let totalServices = 0;
  const methodCounts: Record<string, number> = {};

  for (const mod of doc) {
    for (const [, svcDoc] of Object.entries(mod.services)) {
      totalServices++;
      for (const [method, paths] of Object.entries(svcDoc)) {
        const count = Object.keys(paths).length;
        totalRoutes += count;
        methodCounts[method] = (methodCounts[method] ?? 0) + count;
      }
    }
  }

  return (_req: any, res: any) => {
    const statsHtml = `
      <div class="stats">
        <div class="stat"><div class="num">${doc.length}</div><div class="label">Modules</div></div>
        <div class="stat"><div class="num">${totalServices}</div><div class="label">Services</div></div>
        <div class="stat"><div class="num">${totalRoutes}</div><div class="label">Routes</div></div>
        ${Object.entries(methodCounts)
          .map(([m, c]) => `<div class="stat"><div class="num">${c}</div><div class="label">${m}</div></div>`)
          .join("")}
      </div>`;

    const modulesHtml = doc
      .map((mod) => renderModule(mod, t))
      .join("");

    const body = `
      <div class="page-header">
        <h1>${appName} — API Routes</h1>
        <div class="meta">${totalRoutes} routes across ${totalServices} services in ${doc.length} modules</div>
      </div>
      <input type="text" class="search-bar" placeholder="Search routes... (e.g. GET /users)" id="search"/>
      ${statsHtml}
      <div id="modules">
        ${modulesHtml || '<div class="empty">No routes registered.</div>'}
      </div>
      <script>
        document.getElementById('search').addEventListener('input', function(e) {
          var q = e.target.value.toLowerCase();
          document.querySelectorAll('.module-section').forEach(function(modEl) {
            var cards = modEl.querySelectorAll('.service-card');
            var modVisible = 0;
            cards.forEach(function(card) {
              var routes = card.querySelectorAll('.route-row');
              var visible = 0;
              routes.forEach(function(row) {
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

    const html = layoutShell(`${appName} — API Docs`, t, body, apiStyles(t));
    return res.status(200).type("html").send(html);
  };
};
