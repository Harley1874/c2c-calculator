import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RecordCreateInput) {
    return this.prisma.record.create({ data });
  }

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
    // 软删除
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
  
  async clearAll() {
      // 这里的逻辑可能需要调整，比如只清空当前用户的
      // 暂时用 updateMany 模拟清空
      return this.prisma.record.updateMany({
          where: { isDeleted: false },
          data: { isDeleted: true }
      });
  }
}

