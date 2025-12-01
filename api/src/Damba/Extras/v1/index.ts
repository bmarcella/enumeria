/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/**
 * Extracts the parameter list from a function using string parsing.
 */
function getParamList(fn: Function): string {
  const src = fn.toString().trim();

  // Function forms:
  // - function name(param1, param2) {}
  // - async function name(param1, param2) {}
  // - (param1, param2) => {}
  // - param => {}
  // - async (param) => {}
  
  const match =
    src.match(/^[\s\S]*?\(([^)]*)\)/) ||                 // normal (a,b)
    src.match(/^[\s\S]*?([a-zA-Z0-9_]+)\s*=>/) ||        // single param arrow (a=>)
    null;

  if (!match) return "";

  const raw = match[1] || match[0];
  return raw
    .replace(/=>/, "")      // remove =>
    .replace(/\(/g, "")     // remove (
    .replace(/\)/g, "")     // remove )
    .trim();
}

/**
 * Convert a full behavior registry object to JSON-safe format
 */
export function extrasToJSON(registry: Record<string, any>) {
  const out: Record<string, any> = {};

  for (const groupKey of Object.keys(registry)) {
    const group = registry[groupKey];
    const jsonGroup: Record<string, string> = {};

    for (const fnKey of Object.keys(group)) {
      const fn = group[fnKey];

      if (typeof fn === "function") {
        const name = fn.name || fnKey;
        const params = getParamList(fn);
        const isAsync = fn.constructor.name === "AsyncFunction";

        jsonGroup[fnKey] = isAsync
          ? `[AsyncFunction: ${name}(${params})]`
          : `[Function: ${name}(${params})]`;
      }
    }

    out[groupKey] = jsonGroup;
  }

  return out;
}
