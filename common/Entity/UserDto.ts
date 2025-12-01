export type LoginStrategy = 'google' | 'damba' | 'github';
export interface CurrentSetting {
  orgId?: string,
  projId? : string,
  appId? : string,
  moduleId? : string,
  servId?: string,
  env?: string
}
interface BaseUser {
  id?: string;
  googleSub?: string;
  email?: string;
  emailVerified?: boolean;
  firstName?: string;
  lastName?: string;
  picture?: string | null;
  issuer?: string;
  audience?: string;
  archived?: boolean;
  disabled?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  edit?: boolean;
  view?: boolean;
  remove?: boolean;
  lock?: boolean;
  loginStragtegy?: LoginStrategy;
  currentSetting?: CurrentSetting;
}
export interface SessionUser extends BaseUser {
  authority?: string[];
}

export interface UserDto extends BaseUser {
  authority?: any[];
}

export interface ClientTokenDTO {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  // expose id_token ONLY if your UI needs to read claims locally
  id_token: string;
}

export interface AuthResponseDTO {
  user: UserDto;
  tokens: ClientTokenDTO;
}

export interface AuthErrorDTO { code?: string; error?: string }
