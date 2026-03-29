{
  type: "project";
  files: ["README.md", ".gitignore", "docker-compose.yml"];
  subDirectories: [
    {
      name: "api",
      files: [
        "package.json",
        ".env",
        ".env.example",
        ".gitignore",
        "tsconfig.json",
        "docker-compose.yml",
        "README.md",
        "jest.config.js",
        ".prettierrc",
        ".eslintrc.js",
        "nodemon.json",
      ],
      subDirectories: [
        {
          name: "src",
          files: ["index.ts", "multer.ts"],
          subDirectories: [
            {
              name: "config",
              files: ["app.ts"],
            },
            {
              name: "modules {X}",
              files: ["index.ts"],
              subDirectories: [
                {
                  name: "services {Y}",
                  files: ["index.ts"],
                  subDirectories: [
                    {
                      name: "behaviors {Z}",
                      files: ["index.ts"],
                      subDirectories: [],
                    },
                    {
                      name: "behaviors {Z}",
                      files: ["index.ts"],
                      subDirectories: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "ui",
      files: [
        "package.json",
        ".gitignore",
        "tsconfig.json",
        "docker-compose.yml",
      ],
      subDirectories: [],
    },
    {
      name: "packages",
      subDirectories: [
        {
          name: "validators",
          files: ["package.json", "tsconfig.json"],
          subDirectories: [],
        },
        {
          name: "database",
          files: ["package.json", "tsconfig.json"],
          subDirectories: [],
        },
      ],
    },
  ];
}
