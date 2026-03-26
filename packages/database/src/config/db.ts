import { Validators } from "../entities/Validator";
import { AppServices } from "../entities/AppServices";
import { Application } from "../entities/Application";
import { Behavior } from "../entities/Behaviors";
import { Entities } from "../entities/CanvasBox";
import { ChatAi } from "../entities/ChatAi";
import { Contributor } from "../entities/Contributor";
import DambaCoreCode from "../entities/DambaCoreCode";
import { Extra, Extra_Hook } from "../entities/Extra";
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
import { AppFile } from "../entities/AppFile";
import { BehaviorConfigValidator } from "../entities/Behaviors/BehaviorValidatorConfig";
import { CodeFile } from "../entities/Behaviors/CodeFile";

export const DBEntities = [
  Behavior,
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
  Validators,
  BehaviorConfigValidator,
  Middleware,
  Policy,
  Extra,
  Extra_Hook,
  CodeFile,
  Entities,
  Invitation,
  DambaCoreCode,
  AppFile,
  ...AgentMarketplaceEntities,
];
