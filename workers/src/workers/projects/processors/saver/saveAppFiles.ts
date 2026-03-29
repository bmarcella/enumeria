/* eslint-disable @typescript-eslint/no-explicit-any */
import { DambaRepository } from '@Damba/v2/dao';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { Application } from '@Database/entities/Application';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { saveCodeFile } from './helpers';

// ─── Template Generators ────────────────────────────────────────────────────
const generateTsConfig = (appType: string): string => {
  const isPackage = appType.startsWith('package');
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'es2020',
        module: isPackage ? 'commonjs' : 'NodeNext',
        moduleResolution: isPackage ? 'node' : 'NodeNext',
        baseUrl: '.',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        paths: {
          '@App/*': ['./src/*'],
          '@Damba/*': ['../common/Damba/*'],
          '@Database/*': ['../packages/database/src/*'],
          '@Validators/*': ['../packages/validators/src/*'],
          '@Policies/*': ['../packages/policies/src/*'],
        },
      },
      include: ['src'],
      exclude: ['node_modules', 'dist'],
    },
    null,
    2,
  );
};

const generatePackageJson = (app: Application, project: Project): string => {
  const appName = (app.name ?? 'app').toLowerCase().replace(/\s+/g, '-');
  const projectName = (project.name ?? 'project').toLowerCase().replace(/\s+/g, '-');
  const isApi = app.type_app === 'api' || app.type_app === 'microservice';
  const isUi = app.type_app === 'ui';

  const base: any = {
    name: `@${projectName}/${appName}`,
    version: '0.1.0',
    private: true,
  };

  if (isApi) {
    base.scripts = {
      dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
    };
    base.dependencies = {
      express: '^4.18.0',
      typeorm: '^0.3.0',
      pg: '^8.11.0',
      'body-parser': '^1.20.0',
      cors: '^2.8.5',
      dotenv: '^16.3.0',
      zod: '^3.22.0',
      bullmq: '^5.0.0',
      ioredis: '^5.3.0',
    };
    base.devDependencies = {
      typescript: '^5.3.0',
      'ts-node-dev': '^2.0.0',
      '@types/express': '^4.17.0',
      '@types/node': '^20.0.0',
    };
  } else if (isUi) {
    base.scripts = {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    };
    base.dependencies = {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    };
    base.devDependencies = {
      vite: '^6.0.0',
      typescript: '^5.3.0',
      '@vitejs/plugin-react': '^4.0.0',
    };
  } else {
    // packages
    base.main = 'dist/index.js';
    base.types = 'dist/index.d.ts';
    base.scripts = { build: 'tsc' };
    base.devDependencies = { typescript: '^5.3.0' };
  }

  return JSON.stringify(base, null, 2);
};

const generateDockerfile = (app: Application): string => {
  const isUi = app.type_app === 'ui';
  if (isUi) {
    return `FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;
  }

  return `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
`;
};

const generateGitignore = (): string => `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
`;

const generateEnvExample = (app: Application): string => {
  const isApi = app.type_app === 'api' || app.type_app === 'microservice';
  if (!isApi) return '';
  return `NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379
JWT_PUBLIC_KEY=
JWT_PRIVATE_KEY=
CORS_ORIGINS=http://localhost:5173
`;
};

const generateIndexTs = (app: Application, modules: { name?: string }[]): string => {
  const isApi = app.type_app === 'api' || app.type_app === 'microservice';
  if (!isApi) return `export {};\n`;

  const moduleImports = modules
    .filter((m) => m.name)
    .map(
      (m) => `import { ${m.name!.replace(/[^a-zA-Z0-9]/g, '')}Module } from './modules/${m.name}';`,
    )
    .join('\n');

  const moduleList = modules
    .filter((m) => m.name)
    .map((m) => `    ${m.name!.replace(/[^a-zA-Z0-9]/g, '')}Module,`)
    .join('\n');

  return `import dotenv from 'dotenv';
import express from 'express';
import Damba from '@Damba/v2';
${moduleImports}

dotenv.config();

async function main() {
  await Damba.start({
    modules: [
${moduleList}
    ],
    express,
  });
}
main().catch(console.error);
`;
};

// ─── File Generation ────────────────────────────────────────────────────────

type FileTemplate = {
  name: string;
  path: string;
  content: string;
  fileType: string;
};

const generateFilesForApp = (
  app: Application,
  project: Project,
  modules: { name?: string }[],
): FileTemplate[] => {
  const appType = app.type_app ?? 'api';
  const files: FileTemplate[] = [];

  files.push({
    name: 'tsconfig.json',
    path: '/',
    content: generateTsConfig(appType),
    fileType: 'config',
  });
  files.push({
    name: 'package.json',
    path: '/',
    content: generatePackageJson(app, project),
    fileType: 'manifest',
  });
  files.push({ name: '.gitignore', path: '/', content: generateGitignore(), fileType: 'config' });

  if (appType === 'api' || appType === 'microservice') {
    files.push({
      name: 'Dockerfile',
      path: '/',
      content: generateDockerfile(app),
      fileType: 'docker',
    });
    files.push({
      name: '.env.example',
      path: '/',
      content: generateEnvExample(app),
      fileType: 'env',
    });
    files.push({
      name: 'index.ts',
      path: '/src',
      content: generateIndexTs(app, modules),
      fileType: 'source',
    });
  }

  if (appType === 'ui') {
    files.push({
      name: 'Dockerfile',
      path: '/',
      content: generateDockerfile(app),
      fileType: 'docker',
    });
  }

  return files;
};

// ─── Save ───────────────────────────────────────────────────────────────────

export const saveFilesForApp = async (
  app: Application,
  project: Project,
  modules: { name?: string }[],
  dao: DambaRepository<DataSource>,
): Promise<CodeFile[]> => {
  const files = generateFilesForApp(app, project, modules);

  return Promise.all(
    files.map((f) => {
      const ext = f.name.includes('.') ? f.name.split('.').pop() : undefined;
      return saveCodeFile(dao, {
        name: f.name,
        path: f.path,
        fileExtension: ext,
        data: { content: f.content, fileType: f.fileType },
        stereotype: DStereotype.APPLICATION,
        applicationId: app.id,
        projectId: project.id,
        orgId: (project as any).organization?.id,
        projId: project.id,
        environment: undefined,
        created_by: project.created_by,
      });
    }),
  );
};
