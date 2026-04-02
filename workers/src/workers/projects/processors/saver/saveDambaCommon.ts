/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDambaCode } from '@App/workers/LmmUtils/util';
import { DambaRepository } from '@Damba/v2/dao';
import { DStereotype } from '@Damba/v2/model/DStereotype';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';
import { Project } from '@Database/entities/Project';
import { DataSource } from 'typeorm';
import { relative } from 'path';
import { saveCodeFile } from './helpers';
import { DambaEnvironmentType } from '@Damba/v2/Entity/env';

/**
 * Loads all Damba v2 framework files from disk and persists them
 * as CodeFile entities so the generated project ships with the
 * common/Damba/v2 core at build time.
 */
export const saveDambaCommonFiles = async (
  project: Project,
  dao: DambaRepository<DataSource>,
): Promise<CodeFile[]> => {
  const dambaFiles = await getDambaCode(project.dambaVersion);

  const saved = await Promise.all(
    dambaFiles.map((file) => {
      const relativePath = relative(file.basePath, file.fullPath).replace(/\\/g, '/');
      const filePath = `common/Damba/${project.dambaVersion}/${relativePath}`;
      return saveCodeFile(dao, {
        name: file.name,
        path: filePath,
        fileExtension: file.extension,
        data: { content: file.content },
        stereotype: DStereotype.DAMBA,
        projectId: project.id,
        orgId: (project as any).organization?.id,
        projId: project.id,
        created_by: project.created_by,
        environment: DambaEnvironmentType.DEV,
      });
    }),
  );
  return saved;
};
