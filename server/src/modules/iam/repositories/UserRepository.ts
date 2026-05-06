import { injectable } from 'tsyringe';
import { BaseRepository } from '../../../common/infrastructure/BaseRepository';

@injectable()
export class UserRepository extends BaseRepository {
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; password: string; name?: string; role?: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name ?? data.email.split('@')[0],
        role: data.role ?? 'agent',
      },
    });
  }
}
