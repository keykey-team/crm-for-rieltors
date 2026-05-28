export interface LoginInput {
  email?: unknown;
  password?: unknown;
}

export interface SignupInput {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  accountType?: unknown;
}

export interface AuthenticatedUserDto {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accountType: string;
  plan: string;
  permissions: string | null;
  lastAgencyId: string | null;
}

export interface SignupResultDto {
  id: string;
  email: string;
}

export interface LoginResultDto {
  token: string;
  user: AuthenticatedUserDto;
}

export interface UserCredentialsRecord extends AuthenticatedUserDto {
  password: string;
}
