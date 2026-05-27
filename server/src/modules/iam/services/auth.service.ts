import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { badRequest, conflict, unauthorized } from '../../../common/shared-kernel/errors';
import { env } from '../../../configuration/env';
import { LoginInput, LoginResultDto, SignupInput, SignupResultDto } from '../models/auth.dto';
import { createUser, findPublicUserById, findUserCredentialsByEmail, findUserIdByEmail } from '../repositories/user.repository';

function normalizeRequiredString(value: unknown, field: string): string {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw badRequest(`${field} is required`);
  return normalized;
}

export async function login(input: LoginInput): Promise<LoginResultDto> {
  const email = normalizeRequiredString(input.email, 'Email');
  const password = String(input.password ?? '');
  const user = await findUserCredentialsByEmail(email);
  const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !passwordMatches) throw unauthorized('Invalid credentials');

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: '7d' });
  const { password: _password, ...publicUser } = user;
  return { token, user: publicUser };
}

export async function signup(input: SignupInput): Promise<SignupResultDto> {
  const email = normalizeRequiredString(input.email, 'Email');
  const password = normalizeRequiredString(input.password, 'Password');

  if (await findUserIdByEmail(email)) throw conflict('User already exists');

  const accountType = input.accountType === 'agency' ? 'agency' : 'agent';
  const role = accountType === 'agency' ? 'admin' : 'agent';
  const hashedPassword = await bcrypt.hash(password, 12);
  const name = String(input.name ?? '').trim() || email.split('@')[0];

  return createUser({
    email,
    password: hashedPassword,
    name,
    role,
    accountType,
    plan: 'free',
  });
}

export async function getSessionUser(userId: string) {
  return findPublicUserById(userId);
}