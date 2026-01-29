import { Application } from "@App/entities/Application";
import { AppServices } from "@App/entities/AppServices";
import { Behavior, CodeFile } from "@App/entities/Behaviors";
import { ChatAi } from "@App/entities/ChatAi";
import { Contributor } from "@App/entities/Contributor";
import DambaCoreCode from "@App/entities/DambaCoreCode";
import { Extra } from "@App/entities/Extra";
import { Invitation } from "@App/entities/Invitation";
import { MessageAi } from "@App/entities/MessageAi";
import { Middleware } from "@App/entities/Middleware";
import { Modules } from "@App/entities/Modules";
import { Organization } from "@App/entities/Organization";
import { OrgDomain } from "@App/entities/OrgDomain";
import { OrgMember } from "@App/entities/OrgMember";
import { Policy } from "@App/entities/Policy";
import { Project } from "@App/entities/Project";
import { Role } from "@App/entities/Role";
import { User } from "@App/entities/User";
import { Entities } from "@App/services/CanvasBox/entities/CanvasBox";


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
  DambaCoreCode
];
