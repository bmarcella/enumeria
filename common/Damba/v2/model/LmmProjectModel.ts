import { Http } from "../service/IServiceDamba";

export interface LmmProjectModel {
  projectName: string;
  description: string;
  version: string;
  applications: LmmApplicationModel[];
  files: LmmFileModel[];
}

interface LmmFileModel {
  name: string;
  extension: string;
  path: string;
  content: string;
}

interface LmmApplicationModel {
  dir: string;
  name: string;
  description: string;
  type: string;
  modules?: LmmModuleModel[];
  files: LmmFileModel[];
  entities?: LmmEntityModel[] | string[];
  validators?: LmmValidatorModel[] | string[];
}

interface LmmEntityModel {
  id: string;
  name: string;
  description: string;
  fields: LmmFieldModel[];
  file: LmmFileModel;
  relations: LmmRelationModel[];
}

interface LmmRelationModel {
  name: string;
  type: "@1:1" | "@1:n" | "@n:1" | "@n:n";
  description: string;
  entity: string;
  mappedBy: string;
}

interface LmmFieldModel {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

interface LmmModuleModel {
  name: string;
  description: string;
  services: LmmServiceModel[];
  file: LmmFileModel;
}

interface LmmServiceModel {
  name: string;
  file: LmmFileModel;
  extras: LmmExtraModel[];
  behaviors: LmmBehaviorModel[];
}

interface LmmBehaviorModel {
  name: string;
  file: LmmFileModel;
  hooks: LmmBehaviorHookModel[];
}

interface LmmBehaviorHookModel {
  name: string;
  file: LmmFileModel;
  definition: LmmBehaviorHookDefinitionModel | LmmBehaviorHookDefinitionModel[];
}

interface LmmBehaviorHookDefinitionModel {
  policies?: LmmPolicyModel[];
  middlewares?: LmmMiddlewareModel[];
  extras: LmmExtraModel[];
  config: LmmConfigModel[];
  method: Http;
}

interface LmmConfigModel {
  validators: LmmValidatorBehaviorModel[];
  description: string;
  timeout: number;
}

interface LmmValidatorBehaviorModel {
  body: LmmValidatorModel;
  params: LmmValidatorModel;
  query: LmmValidatorModel;
  response: LmmValidatorModel;
}

interface LmmPolicyModel {
  name: string;
  file: LmmFileModel;
  middlewares: LmmMiddlewareModel[];
}

interface LmmMiddlewareModel {
  name: string;
  file: LmmFileModel;
}

interface LmmExtraModel {
  name: string;
  hooks: LmmHookModel[];
}

interface LmmHookModel {
  name: string;
  file: LmmFileModel;
}

interface LmmValidatorModel {
  id: string;
  name: string;
  type: string;
  description: string;
  file: LmmFileModel;
}
