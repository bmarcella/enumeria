import { DStereotype } from "./DStereotype";

export type Tokens = Record<string, string>;
export type TemplateRender<TCtx = any> = (ctx: TCtx) => string;

export interface TemplateFileSpec<TCtx = any> {
  name: string; // "" allowed (dotfiles)
  extension: string; // always includes dot: ".ts" ".json" ".env"
  required: boolean;
  directory: string; // tokenized: "{appName}/{srcDir}"
  contents: TemplateRender<TCtx>;
  auto_generate: boolean;
}

export interface StereotypeNodeSpec<TCtx = any> {
  directory: string;
  files: TemplateFileSpec<TCtx>[];
  parent: DStereotype | null;
  children: DStereotype[];
}

export const FileManager: Record<DStereotype, StereotypeNodeSpec> = {
  [DStereotype.PROJECT]: {
    directory: "{projectName}/",
    files: [
      {
        name: "",
        extension: ".gitignore",
        required: true,
        directory: "",
        contents: () => `node_modules\n.env\n/dist\n`,
        auto_generate: true,
      },
      {
        name: "README",
        extension: ".md",
        required: true,
        directory: "",
        contents: () => `# ${"{projectName}"}`,
        auto_generate: true,
      },
    ],
    parent: null,
    children: [DStereotype.APPLICATION],
  },
  [DStereotype.APPLICATION]: {
    directory: "{appName}/",
    files: [
      {
        name: "app.config",
        extension: ".ts",
        required: true,
        directory: "{appName}/{srcDir}/config",
        contents: () => `export const AppConfig = {};\n`,
        auto_generate: true,
      },
      {
        name: "damba.import",
        extension: ".ts",
        required: true,
        directory: "{appName}/{srcDir}",
        contents: () => `// Damba importer\n`,
        auto_generate: true,
      },
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "{srcDir}",
        contents: () => `// bootstrap\n`,
        auto_generate: true,
      },
      {
        name: "",
        extension: ".env",
        required: true,
        directory: "",
        contents: () => `PORT=3000\n`,
        auto_generate: true,
      },
      {
        name: "dam.config",
        extension: ".json",
        required: true,
        directory: "",
        contents: () => `{}\n`,
        auto_generate: true,
      },
      {
        name: "package",
        extension: ".json",
        required: true,
        directory: "",
        contents: () => `{}\n`,
        auto_generate: true,
      },
      {
        name: "tsconfig",
        extension: ".json",
        required: true,
        directory: "",
        contents: () => `{}\n`,
        auto_generate: true,
      },
      {
        name: "nodemon",
        extension: ".json",
        required: true,
        directory: "{appName}",
        contents: () => `{}\n`,
        auto_generate: true,
      },
    ],
    parent: null,
    children: [DStereotype.MODULE],
  },

  [DStereotype.MODULE]: {
    parent: DStereotype.APPLICATION,
    directory: "{moduleDirName}/{moduleName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// module barrel\n`,
        auto_generate: true,
      },
    ],
    children: [DStereotype.SERVICE],
  },

  [DStereotype.SERVICE]: {
    directory: "{serviceName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// service behaviors\n`,
        auto_generate: true,
      },
      {
        name: "{serviceName}CrudConfig",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// crud config \n`,
        auto_generate: true,
      },
    ],
    parent: DStereotype.MODULE,
    children: [
      DStereotype.BEHAVIOR,
      DStereotype.MIDDLEWARE,
      DStereotype.POLICY,
    ],
  },

  [DStereotype.BEHAVIOR]: {
    directory: "{behaviorsDirName}/{behaviorName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// behavior\n`,
        auto_generate: true,
      },
    ],
    parent: DStereotype.SERVICE, // ✅ fixed
    children: [DStereotype.EXTRA],
  },

  [DStereotype.EXTRA]: {
    directory: "{extrasDirName}/{extraName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// extra\n`,
        auto_generate: true,
      },
    ],
    parent: DStereotype.BEHAVIOR,
    children: [],
  },

  [DStereotype.MIDDLEWARE]: {
    directory: "{middlewaresDirName}/{middlewareName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// middleware\n`,
        auto_generate: true,
      },
    ],
    parent: DStereotype.SERVICE,
    children: [],
  },

  [DStereotype.POLICY]: {
    directory: "{policiesDirName}/{policyName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// policy\n`,
        auto_generate: true,
      },
    ],
    parent: DStereotype.SERVICE,
    children: [],
  },

  [DStereotype.ENTITY]: {
    directory: "{entitiesDirName}/{entityName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// entity\n`,
        auto_generate: true,
      },
    ],
    parent: null,
    children: [],
  },

  [DStereotype.INDEX]: {
    directory: "{indexDirName}/{indexName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// index\n`,
        auto_generate: true,
      },
    ],
    parent: null,
    children: [],
  },

  [DStereotype.DAMBA]: {
    directory: "{dambaDirName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// damba\n`,
        auto_generate: true,
      },
    ],
    parent: null,
    children: [],
  },

  [DStereotype.CONFIG]: {
    directory: "{configDirName}/",
    files: [
      {
        name: "index",
        extension: ".ts",
        required: true,
        directory: "",
        contents: () => `// config\n`,
        auto_generate: true,
      },
    ],
    parent: null,
    children: [],
  },
} as const;
