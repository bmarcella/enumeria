import { User } from '../services/User/entities/User';
import { ChatAi } from '../services/AiAgentChat/entities/ChatAi';
import { MessageAi } from '../services/AiAgentChat/entities/MessageAi';
import { Contributor } from '../services/Organization/entities/Contributor';
import { Organization } from '../services/Organization/entities/Organization';
import { OrgDomain } from '../services/Organization/entities/OrgDomain';
import { OrgMember } from '../services/Organization/entities/OrgMember';
import { Project } from '../services/Projects/entities/Project';
import { Invitation } from '../services/Invitations/entities/Invitation';
import { Role } from '@App/services/User/entities/Role';
import { Application } from '@App/services/Application/entities/Application';
import { Modules } from '@App/services/Modules/entities/Modules';
import { AppServices } from '@App/services/AppService/entities/AppServices';
import { Entities } from '@App/services/CanvasBox/entities/CanvasBox';
import { Behavior, CodeFile } from '@App/services/Behaviors/entities/Behaviors';
import { Policy } from '@App/services/Behaviors/entities/Policy';
import { Extra } from '@App/services/Behaviors/entities/Extra';
import { Middleware } from '@App/services/Behaviors/entities/Middleware';

export const DBConfig = {
  entities: [
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
  ],
};
