import { AppStructure, LanguageKey, TypeApp } from '../../../../common/Entity/AppStructure';
import { Application } from './entities/Application';


// Provide a minimal shape for validation without importing the ORM entity
export type ApplicationLike = Pick<Application, "language" | "runtime" | "type" | "framework" | "packageName" | "host" | "port" | "name"
> & { language: string; type: TypeApp; framework?: string | null };

export function isSupportedLanguage(language: string): language is LanguageKey {
  return language in AppStructure.languages;
}

export function allowedRuntimes(language: LanguageKey): readonly string[] {
  return AppStructure.languages[language].runtimes;
}

export function allowedFrameworks(language: LanguageKey, type: TypeApp): readonly string[] {
  return AppStructure.languages[language].types[type].frameworks;
}

export function validateApplication(app: ApplicationLike) {
  const errors: string[] = [];

  if (!isSupportedLanguage(app.language)) {
    errors.push(`Unsupported language "${app.language}". Allowed: ${Object.keys(AppStructure.languages).join(", ")}`);
  } else {
    const lang = app.language as LanguageKey;
    if (!allowedRuntimes(lang).includes(app.runtime)) {
      errors.push(
        `Invalid runtime "${app.runtime}" for ${lang}. Allowed: ${allowedRuntimes(lang).join(", ")}`
      );
    }

    const fws = allowedFrameworks(lang, app.type);
    if ((app.framework ?? "") && fws.length && !fws.includes(app.framework!)) {
      errors.push(
        `Invalid framework "${app.framework}" for ${lang}/${app.type}. Allowed: ${fws.join(", ")}`
      );
    } else if (fws.length && !app.framework) {
      errors.push(
        `Framework is required for ${lang}/${app.type}. Allowed: ${fws.join(", ")}`
      );
    }
  }

  // Some basic sanity checks you might want
  if (!app.name?.trim()) errors.push("name is required");
  if (!app.packageName?.trim()) errors.push("packageName is required");
  if (!app.host?.trim()) errors.push("host is required");
  if (typeof app.port !== "number" || !Number.isInteger(app.port)) errors.push("port must be an integer");

  return { ok: errors.length === 0, errors };
}

/** Convenient defaults per language/type (customize as you like) */
export function defaultApplicationConfig(language: LanguageKey, type: TypeApp) {
  const runtimes = allowedRuntimes(language);
  const frameworks = allowedFrameworks(language, type);
  return {
    language,
    type,
    runtime: runtimes[0] ?? "",
    framework: frameworks[0] ?? undefined,
  };
}
