import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { RecordsService } from './records.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('records')
export class RecordsController {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly prisma: PrismaService // 临时注入，用于查找默认用户
  ) {}

  private async getDefaultUserId() {
    // 临时逻辑：查找或创建默认用户
    let user = await this.prisma.user.findUnique({ where: { username: 'default_user' } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          username: 'default_user',
          password: 'hashed_password_placeholder', // 实际应加密
        }
      });
    }
    return user.id;
  }

  @Post()
  async create(@Body() createRecordDto: { amount: string; price: string; total: string; name?: string }) {
    const userId = await this.getDefaultUserId();
    return this.recordsService.create({
      amount: createRecordDto.amount,
      price: createRecordDto.price,
      total: createRecordDto.total,
      name: createRecordDto.name,
      user: { connect: { id: userId } }
    });
  }

  @Get()
  findAll() {
    return this.recordsService.findAll();
  }

  @Patch(':id/favorite')
  toggleFavorite(@Param('id') id: string) {
    return this.recordsService.toggleFavorite(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recordsService.remove(id);
  }
  
  @Delete()
  clearAll() {
      return this.recordsService.clearAll();
  }
}

