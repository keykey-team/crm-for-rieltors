import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';
import { env } from '../../../app/config/env';
import { BaseService } from '../../../common/infrastructure/BaseService';
import { ConflictError, UnauthorizedError } from '../../../common/errors';
import { UserRepository } from '../repositories/UserRepository';
import { LoginDto } from '../models/dto/LoginDto';
import { RegisterDto } from '../models/dto/RegisterDto';

@injectable()
export class AuthService extends BaseService {
  constructor(@inject(UserRepository) private readonly userRepository: UserRepository) {
    super();
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    return {
      user: this.mapUser(user),
      token: this.signToken(user.id, user.email, user.role),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return {
      user: this.mapUser(user),
      token: this.signToken(user.id, user.email, user.role),
    };
  }

  async getSession(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Session not found');
    }

    return this.mapUser(user);
  }

  private signToken(id: string, email: string, role: string): string {
    return jwt.sign({ id, email, role }, env.jwtSecret, { expiresIn: '7d' });
  }

  private mapUser(user: { id: string; email: string; name: string | null; role: string }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
