import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RecordCreateInput) {
    return this.prisma.record.create({ data });
  }

  async findAllByUser(userId: string) {
    return this.prisma.record.findMany({
      orderBy: { createdAt: 'desc' },
      where: { userId, isDeleted: false }
    });
  }

  // 保留旧的作为参考，虽然不用了
  async findAll() {
    return this.prisma.record.findMany({
      orderBy: { createdAt: 'desc' },
      where: { isDeleted: false }
    });
  }

  async findOne(id: string) {
    return this.prisma.record.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.RecordUpdateInput) {
    return this.prisma.record.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.record.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async toggleFavorite(id: string) {
    const record = await this.findOne(id);
    if (!record) return null;
    return this.update(id, { isFavorite: !record.isFavorite });
  }
  
  async clearAllByUser(userId: string) {
      return this.prisma.record.updateMany({
          where: { userId, isDeleted: false },
          data: { isDeleted: true }
      });
  }
}
