// app-structure.ts

export type TypeApp = "web" | "mobile" | "api" | "cli" | "library";

type AppTypeEntry = {
  frameworks: readonly string[];
};

type LanguageEntry = {
  runtimes: readonly string[];
  types: Record<TypeApp, AppTypeEntry>;
};

export const AppStructure = {
  languages: {
    // ---------- TypeScript ----------
    typescript: {
      runtimes: ["node18", "node20", "bun1", "deno1"] as const,
      types: {
        api:     { frameworks: ["damba", "express", "fastify", "nestjs", "hapi", "koa"] as const },
        web:     { frameworks: ["damba", "nextjs", "remix", "nuxt", "angular", "vue", "sveltekit"] as const },
        cli:     { frameworks: ["damba", "oclif", "yargs", "commander"] as const },
        library: { frameworks: ["damba", "tsup", "rollup", "tsdx", "vite-lib"] as const },
        mobile:  { frameworks: ["react-native", "ionic", "nativescript"] as const },
      },
    } satisfies LanguageEntry,

    // ---------- JavaScript ----------
    javascript: {
      runtimes: ["node18", "node20", "bun1", "deno1"] as const,
      types: {
        api:     { frameworks: ["express", "fastify", "nestjs", "hapi", "koa"] as const },
        web:     { frameworks: ["nextjs", "remix", "nuxt", "angular", "vue", "sveltekit"] as const },
        cli:     { frameworks: ["oclif", "yargs", "commander"] as const },
        library: { frameworks: ["rollup", "tsup", "vite-lib"] as const },
        mobile:  { frameworks: ["react-native", "ionic", "nativescript"] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Python ----------
    python: {
      runtimes: ["python3.10", "python3.11", "python3.12"] as const,
      types: {
        api:     { frameworks: ["fastapi", "flask", "django-rest-framework"] as const },
        web:     { frameworks: ["django", "flask"] as const },
        cli:     { frameworks: ["typer", "click", "argparse"] as const },
        library: { frameworks: ["setuptools", "poetry"] as const },
        mobile:  { frameworks: [] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Go ----------
    go: {
      runtimes: ["go1.21", "go1.22"] as const,
      types: {
        api:     { frameworks: ["gin", "fiber", "echo", "chi"] as const },
        web:     { frameworks: ["gin", "fiber", "echo", "htmx+templ"] as const },
        cli:     { frameworks: ["cobra", "urfave-cli"] as const },
        library: { frameworks: ["std"] as const },
        mobile:  { frameworks: [] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Java ----------
    java: {
      runtimes: ["java8", "java11", "java17", "java21"] as const,
      types: {
        api:     { frameworks: ["springboot", "quarkus", "micronaut"] as const },
        web:     { frameworks: ["spring-mvc", "jakarta-ee"] as const },
        cli:     { frameworks: ["picocli"] as const },
        library: { frameworks: ["maven", "gradle"] as const },
        mobile:  { frameworks: ["android"] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Kotlin ----------
    kotlin: {
      runtimes: ["jvm17", "jvm21"] as const,
      types: {
        api:     { frameworks: ["ktor", "springboot"] as const },
        web:     { frameworks: ["ktor-server", "spring-mvc"] as const },
        cli:     { frameworks: ["kotlinx-cli"] as const },
        library: { frameworks: ["gradle", "maven"] as const },
        mobile:  { frameworks: ["android"] as const },
      },
    } satisfies LanguageEntry,

    // ---------- C# / .NET ----------
    csharp: {
      runtimes: ["net6.0", "net7.0", "net8.0"] as const,
      types: {
        api:     { frameworks: ["aspnet-core-minimal", "aspnet-core-webapi"] as const },
        web:     { frameworks: ["aspnet-core-mvc", "blazor"] as const },
        cli:     { frameworks: ["system-commandline", "spectre.console"] as const },
        library: { frameworks: ["classlib"] as const },
        mobile:  { frameworks: ["maui", "xamarin-legacy"] as const },
      },
    } satisfies LanguageEntry,

    // ---------- PHP ----------
    php: {
      runtimes: ["php8.1", "php8.2", "php8.3"] as const,
      types: {
        api:     { frameworks: ["laravel", "symfony", "lumen", "slim"] as const },
        web:     { frameworks: ["laravel", "symfony"] as const },
        cli:     { frameworks: ["symfony-console"] as const },
        library: { frameworks: ["composer-lib"] as const },
        mobile:  { frameworks: [] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Ruby ----------
    ruby: {
      runtimes: ["ruby3.1", "ruby3.2", "ruby3.3"] as const,
      types: {
        api:     { frameworks: ["rails-api", "grape", "sinatra"] as const },
        web:     { frameworks: ["rails", "sinatra"] as const },
        cli:     { frameworks: ["thor", "gli"] as const },
        library: { frameworks: ["bundler-gem"] as const },
        mobile:  { frameworks: [] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Rust ----------
    rust: {
      runtimes: ["rust1.78+", "stable"] as const,
      types: {
        api:     { frameworks: ["actix-web", "axum", "rocket"] as const },
        web:     { frameworks: ["axum+templates", "leptos-ssr"] as const },
        cli:     { frameworks: ["clap", "argo"] as const },
        library: { frameworks: ["cargo-lib"] as const },
        mobile:  { frameworks: [] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Dart ----------
    dart: {
      runtimes: ["dart3"] as const,
      types: {
        api:     { frameworks: ["shelf", "dart_frog"] as const },
        web:     { frameworks: ["angular-dart", "shelf+ssr"] as const },
        cli:     { frameworks: ["args"] as const },
        library: { frameworks: ["pub-lib"] as const },
        mobile:  { frameworks: ["flutter"] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Swift ----------
    swift: {
      runtimes: ["swift5.9", "swift5.10"] as const,
      types: {
        api:     { frameworks: ["vapor"] as const },
        web:     { frameworks: ["vapor"] as const },
        cli:     { frameworks: ["swift-argument-parser"] as const },
        library: { frameworks: ["spm-lib"] as const },
        mobile:  { frameworks: ["ios-swiftui", "ios-uikit"] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Scala ----------
    scala: {
      runtimes: ["scala2.13", "scala3"] as const,
      types: {
        api:     { frameworks: ["akka-http", "http4s", "play"] as const },
        web:     { frameworks: ["play"] as const },
        cli:     { frameworks: ["picocli4j", "scopt"] as const },
        library: { frameworks: ["sbt-lib", "mill-lib"] as const },
        mobile:  { frameworks: [] as const },
      },
    } satisfies LanguageEntry,

    // ---------- Elixir ----------
    elixir: {
      runtimes: ["elixir1.15", "elixir1.16"] as const,
      types: {
        api:     { frameworks: ["phoenix"] as const },
        web:     { frameworks: ["phoenix"] as const },
        cli:     { frameworks: ["mix"] as const },
        library: { frameworks: ["mix-lib"] as const },
        mobile:  { frameworks: [] as const },
      },
    } satisfies LanguageEntry,
  } as const,
} as const;

export type LanguageKey = keyof typeof AppStructure.languages;

/* ===== Helpers you can reuse ===== */

export function isSupportedLanguage(language: string): language is LanguageKey {
  return language in AppStructure.languages;
}

export function allowedRuntimes(language: LanguageKey): readonly string[] {
  return AppStructure.languages[language].runtimes;
}

export function allowedFrameworks(language: LanguageKey, type: TypeApp): readonly string[] {
  return AppStructure.languages[language].types[type].frameworks;
}

/** Minimal shape for validating an incoming Application-like object */
export type ApplicationLike = {
  language: string;
  runtime: string;
  type: TypeApp;
  framework?: string | null;
  name?: string;
  packageName?: string;
  host?: string;
  port?: number;
};

export function validateApplication(app: ApplicationLike) {
  const errors: string[] = [];
  if (!isSupportedLanguage(app.language)) {
    errors.push(`Unsupported language "${app.language}". Allowed: ${Object.keys(AppStructure.languages).join(", ")}`);
    return { ok: false, errors };
  }

  const lang = app.language as LanguageKey;
  if (!allowedRuntimes(lang).includes(app.runtime)) {
    errors.push(`Invalid runtime "${app.runtime}" for ${lang}. Allowed: ${allowedRuntimes(lang).join(", ")}`);
  }

  const fws = allowedFrameworks(lang, app.type);
  if (fws.length) {
    if (!app.framework) {
      errors.push(`Framework is required for ${lang}/${app.type}. Allowed: ${fws.join(", ")}`);
    } else if (!fws.includes(app.framework)) {
      errors.push(`Invalid framework "${app.framework}" for ${lang}/${app.type}. Allowed: ${fws.join(", ")}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

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
