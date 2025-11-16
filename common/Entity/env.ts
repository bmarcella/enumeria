export const DambaEnvironments = (t: any) => [
  { value: DambaEnvironmentType.DEV, label: t(DambaEnvironmentType.DEV) },
  { value: DambaEnvironmentType.QA, label: t(DambaEnvironmentType.QA) },
  { value: DambaEnvironmentType.STAGING, label: t(DambaEnvironmentType.STAGING) },
  { value: DambaEnvironmentType.PROD, label: t(DambaEnvironmentType.PROD) },
] as const

export enum DambaEnvironmentType {
  DEV = 'envs.dev',
  QA = 'envs.qa',
  STAGING = 'envs.staging',
  PROD = 'envs.prod',
}

export const EnvironmentLabels: Record<DambaEnvironmentType, string> = {
    [DambaEnvironmentType.DEV]: 'Development',
    [DambaEnvironmentType.QA]: 'Quality Assurance (QA)',
    [DambaEnvironmentType.STAGING]: 'Staging / Pre-Production',
    [DambaEnvironmentType.PROD]: 'Production'
};