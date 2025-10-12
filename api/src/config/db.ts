
import { User } from "../entities/User";
import { ChatAi } from "../entities/ChatAi";
import { MessageAi } from "../entities/MessageAi";
import { Role } from "../entities/Role";
import { Contributor } from "../entities/Contributor";
import { Organization } from "../entities/Organization";
import { OrgDomain } from "../entities/OrgDomain";
import { OrgMember } from "../entities/OrgMember";
import { Project } from "../entities/Project";
import { Invitation } from "../entities/Invitation";

export const DBConfig = {
   entities:  [User, Role, ChatAi, MessageAi, Organization, OrgMember, OrgDomain, Contributor, Project, Invitation],
}