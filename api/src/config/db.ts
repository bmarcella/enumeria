
import { User } from "../services/User/entities/User";
import { ChatAi } from "../services/AiAgentChat/entities/ChatAi";
import { MessageAi } from "../services/AiAgentChat/entities/MessageAi";
import { Contributor } from "../services/Organization/entities/Contributor";
import { Organization } from "../services/Organization/entities/Organization";
import { OrgDomain } from "../services/Organization/entities/OrgDomain";
import { OrgMember } from "../services/Organization/entities/OrgMember";
import { Project } from "../services/Projects/entities/Project";
import { Invitation } from "../services/Invitations/entities/Invitation";
import { Application } from "services/Application/entities/Application";
import { Role } from "services/User/entities/Role";
import { Modules } from "services/Modules/entities/Modules";
import { AppServices } from "services/AppService/entities/AppServices";
import { Entities } from "services/CanvasBox/entities/CanvasBox";

export const DBConfig = {
   entities:  [User, Role, ChatAi, MessageAi, Organization, OrgMember, OrgDomain, Contributor, Project, Application, Modules, AppServices, Entities, Invitation],
}