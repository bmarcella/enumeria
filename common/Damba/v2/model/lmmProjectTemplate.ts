import { LmmProjectModel } from "./LmmProjectModel";

export const lmmProjectTemplate: LmmProjectModel = {
  projectName: "test",
  description: "test",
  version: "1.0.0",
  applications: [
    {
      name: "api",
      description: "api",
      type: "api",
      dir: "/api",
      modules: [
        {
          name: "task",
          description: "task module",
          services: [
            {
              name: "taskService",
              file: {
                name: "taskService",
                extension: "ts",
                path: "src/modules/task/services",
                content: "",
              },
              extras: [],
              behaviors: [],
            },
          ],
          file: {
            name: "taskModule",
            extension: "ts",
            path: "src/modules/task",
            content: `
            `,
          },
        },
      ],
      files: [
        {
          name: "package",
          extension: "json",
          path: "",
          content: `
          `,
        },
        {
          name: ".gitignore",
          extension: "",
          path: "",
          content: `
          `,
        },
        {
          name: "tsconfig",
          extension: "json",
          path: "",
          content: `
          `,
        },
        {
          name: "docker-compose",
          extension: "yml",
          path: "",
          content: `
          `,
        },
      ],
      entities: ["1damba"],
      validators: ["1damba-validator"],
    },
    {
      name: "ui",
      description: "ui",
      type: "ui",
      dir: "/ui",
      files: [],
    },
    {
      name: "packages",
      description: "packages for database ",
      type: "packages",
      dir: "src/packages",
      files: [],
      entities: [
        {
          id: "1damba",
          name: "task",
          description: "task entity",
          fields: [
            {
              name: "name",
              type: "string",
              description: "task name",
              required: true,
            },
            {
              name: "description",
              type: "string",
              description: "task description",
              required: false,
            },
          ],
          file: {
            name: "task",
            extension: "ts",
            path: "src/entities",
            content: "",
          },
          relations: [],
        },
      ],
    },
    {
      name: "validators",
      description: "packages for validation",
      type: "packages",
      dir: "packages/validators",
      files: [
        {
          name: "taskValidator",
          extension: "ts",
          path: "src/validators",
          content: "",
        },
      ],
      validators: [
        {
          id: "1damba-validator",
          name: "taskValidator",
          type: "taskValidator",
          description: "task validator",
          file: {
            name: "taskValidator",
            extension: "ts",
            path: "packages/validators/src/contracts",
            content: `
            `,
          },
        },
      ],
    },
  ],
  files: [
    {
      name: "README",
      extension: "md",
      path: "",
      content: "# test\n\n## description\n\n## version",
    },
    {
      name: ".gitignore",
      extension: "",
      path: "",
      content: "# test\n\n## description\n\n## version",
    },
    {
      name: "docker-compose",
      extension: "yml",
      path: "",
      content: "# test\n\n## description\n\n## version",
    },
  ],
};
