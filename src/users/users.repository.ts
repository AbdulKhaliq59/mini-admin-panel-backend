import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateUserDto & { emailHash: string; signature: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    return this.prisma.user.create({ data });
  }

  async findAll(skip = 0, take = 10) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ]);
    return { users, total };
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateUserDto & { emailHash?: string; signature?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async findAllForExport() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getUserStatsLast7Days() {
    const users = await this.prisma.user.findMany({
      select: { createdAt: true },
    });

    const stats = new Map<string, number>();
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      stats.set(dateStr, 0);
    }

    users.forEach((user) => {
      const dateStr = user.createdAt.toISOString().split('T')[0];
      if (stats.has(dateStr)) {
        stats.set(dateStr, (stats.get(dateStr) || 0) + 1);
      }
    });

    return Array.from(stats.entries())
      .map(([date, count]) => ({ date, count }));
  }
}
