import { DEvent } from '@Damba/v2/service/DEvent';
import { DambaApi, Behavior } from '@Damba/v2/service/DambaService';
import { CodeFile } from '@Database/entities/Behaviors/CodeFile';

export const getAllCodeFiles: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { projectId, applicationId, env } = e.in.params;
    const codeFiles = await api?.DRepository().DGetAll(CodeFile, {
      where: {
        projectId,
        applicationId,
        env,
      },
    });
    return e.out.send(codeFiles);
  };
};

export const getCodeFileByProjectId: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { projectId } = e.in.params;
    const codeFiles = await api?.DRepository().DGetAll(CodeFile, {
      where: {
        projectId,
      },
    });
    return e.out.send(codeFiles);
  };
};

export const getCodeFileByApplicationId: Behavior = (api?: DambaApi) => {
  return async (e: DEvent) => {
    const { applicationId } = e.in.params;
    const codeFiles = await api?.DRepository().DGetAll(CodeFile, {
      where: {
        applicationId,
      },
    });
    return e.out.send(codeFiles);
  };
};
