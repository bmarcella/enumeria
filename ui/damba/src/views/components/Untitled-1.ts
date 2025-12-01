// const createService = () => ({
  //   ...structuredClone(DambaServiceTemplate),
  //   id: uuidv4(),
  //   created_at: date,
  //   created_by: owner,
  //   canvasBoxes: [createEntity()],
  // });

  // const createModule = () => ({
  //   ...structuredClone(DambaModuleTemplate),
  //   id: uuidv4(),
  //   created_at: date,
  //   created_by: owner,
  //   services: [createService()],
  // });

  // Build environment-specific modules
  const data: Record<DambaEnvironmentType, any> = {} as Record<DambaEnvironmentType, any>;
  // for (const env of envs) {
  //   data[env] = [createModule()];
  // }

   const date = new Date();
  const envs : DambaEnvironmentType[] = proj.environments!;