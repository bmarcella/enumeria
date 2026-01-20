import { readdir, readFile } from "fs/promises";
import { join, parse } from "path";

export interface IFileDescriptor {
  name: string;
  extension: string;
  content: string;
  fullPath: string;
  basePath: string;
}

export class FileSystemReader {
  public static async readAll(basePath: string): Promise<IFileDescriptor[]> {
    const files: IFileDescriptor[] = [];

    await this.walk(basePath, basePath, files);

    return files;
  }

  private static async walk(
    basePath: string,
    currentPath: string,
    result: IFileDescriptor[]
  ): Promise<void> {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await this.walk(basePath, fullPath, result);
        continue;
      }

      if (!entry.isFile()) continue;

      const parsed = parse(fullPath);
      const content = await readFile(fullPath, "utf8");

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

export const LoadFiles = async (basePath: string) => {
  const files = await FileSystemReader.readAll(basePath);
  return files;
};
