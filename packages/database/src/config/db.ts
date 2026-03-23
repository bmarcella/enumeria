import { AppServices } from "../entities/AppServices";
import { Application } from "../entities/Application";
import { Behavior, CodeFile } from "../entities/Behaviors";
import { Entities } from "../entities/CanvasBox";
import { ChatAi } from "../entities/ChatAi";
import { Contributor } from "../entities/Contributor";
import DambaCoreCode from "../entities/DambaCoreCode";
import { Extra } from "../entities/Extra";
import { Invitation } from "../entities/Invitation";
import { MessageAi } from "../entities/MessageAi";
import { Middleware } from "../entities/Middleware";
import { Modules } from "../entities/Modules";
import { OrgDomain } from "../entities/OrgDomain";
import { OrgMember } from "../entities/OrgMember";
import { Organization } from "../entities/Organization";
import { Policy } from "../entities/Policy";
import { Project } from "../entities/Project";
import { Role } from "../entities/Role";
import { User } from "../entities/User";
import { AgentMarketplaceEntities } from "../entities/agents";
import { DataModelerEntities } from "../entities/datamodeler";
import { UseCaseEntities } from "../entities/usecase";
import { ProjectAccess } from "../entities/ProjectAccess";
import { ModuleAccessOverride } from "../entities/ModuleAccessOverride";



export const DBEntities = [
  User,
  Role,
  ChatAi,
  MessageAi,
  Organization,
  OrgMember,
  OrgDomain,
  Contributor,
  Project,
  Application,
  Modules,
  AppServices,
  Behavior,
  Middleware,
  Policy,
  Extra,
  CodeFile,
  Entities,
  Invitation,
  DambaCoreCode,
  ...AgentMarketplaceEntities,
  ...DataModelerEntities,
  ...UseCaseEntities,
  ProjectAccess,
  ModuleAccessOverride,
];
