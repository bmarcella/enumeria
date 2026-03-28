/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Shared Theme ───────────────────────────────────────────────────────────

export interface DambaTheme {
  primary: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  font: string;
}

export const defaultTheme: DambaTheme = {
  primary: "#fb732c",
  bg: "#fafafa",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#1f2937",
  muted: "#6b7280",
  font: "ui-sans-serif, system-ui, -apple-system, sans-serif",
};

// ─── Shared Layout Shell ────────────────────────────────────────────────────

export const layoutShell = (
  title: string,
  theme: DambaTheme,
  body: string,
  extra_styles = "",
) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${theme.font};background:${theme.bg};color:${theme.text};line-height:1.6}
    .container{max-width:1100px;margin:0 auto;padding:24px 16px}
    a{color:${theme.primary};text-decoration:none}
    a:hover{text-decoration:underline}
    code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:0.85em}
    .badge{display:inline-block;font-size:0.7rem;padding:2px 8px;border-radius:9999px;font-weight:600;text-transform:uppercase;letter-spacing:0.03em}
    .page-header{border-bottom:1px solid ${theme.border};padding-bottom:16px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
    .page-header h1{font-size:1.4rem;font-weight:700}
    .page-header .meta{font-size:0.8rem;color:${theme.muted}}
    ${extra_styles}
  </style>
</head>
<body>
  <div class="container">
    ${body}
  </div>
</body>
</html>`;

// ─── HTTP Method Colors ─────────────────────────────────────────────────────

export const methodColors: Record<string, { bg: string; text: string }> = {
  GET: { bg: "#dbeafe", text: "#1d4ed8" },
  POST: { bg: "#dcfce7", text: "#15803d" },
  PATCH: { bg: "#fef9c3", text: "#a16207" },
  PUT: { bg: "#fef3c7", text: "#b45309" },
  DELETE: { bg: "#fee2e2", text: "#dc2626" },
};
