import { readdir, readFile, stat } from "fs/promises";
import { join, parse, resolve } from "path";

export interface IDambaFile {
  id?:string 
  name: string;
  extension: string;
  content: string;
  fullPath: string;
  basePath: string;
}

export class FileSystemReader {
  public static async readAll(basePath: string) {
    const files: IDambaFile [] = [];

    try {
      await stat(basePath);
    } catch {
      throw new Error(`Base path does not exist: ${basePath}`);
    }

    await this.walk(basePath, basePath, files);
    return files;
  }

  private static async walk(
    basePath: string,
    currentPath: string,
    result: any[]
  ) {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await this.walk(basePath, fullPath, result);
        continue;
      }

      if (!entry.isFile()) continue;

      const content = await readFile(fullPath, "utf8");
      const parsed = parse(fullPath);

      result.push({
        name: parsed.name,
        extension: parsed.ext.replace(".", ""),
        content,
        fullPath,
        basePath,
      });
    }
  }
}

export const PROJECT_ROOT = resolve(process.cwd(), "..");

export const LoadFiles = async (basePath: string)  => {
  const files = await FileSystemReader.readAll(resolve(PROJECT_ROOT, basePath));
  return files;
};
