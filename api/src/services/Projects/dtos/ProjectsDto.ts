export interface ProjectDto {
  name: string;
  description: string;
  envs: string[];
}

export interface ApplicationDto {
  name: string;
  type_app: string;
  description: string;
  port?: number;
  host?: string;
}

export interface ProjectDtoWithApps {
  name: string;
  description: string;
  envs: string[];
  applications: ApplicationDto[];
}

export interface UpdateProjectStepDto {
  step: string;
  buildStatus?: string;
}
