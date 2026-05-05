export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
}

export interface AuthActionResult {
  ok: boolean;
  errorKey?: string;
}
