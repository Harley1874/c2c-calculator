import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Request } from '@nestjs/common';
import { RecordsService } from './records.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('records')
@UseGuards(AuthGuard('jwt'))
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  async create(@Request() req, @Body() createRecordDto: { amount: string; price: string; total: string; name?: string }) {
    return this.recordsService.create({
      amount: createRecordDto.amount,
      price: createRecordDto.price,
      total: createRecordDto.total,
      name: createRecordDto.name,
      user: { connect: { id: req.user.userId } }
    });
  }

  @Get()
  findAll(@Request() req) {
    // 这里需要修改 Service 让他支持按 userId 过滤
    // 暂时我们还是返回所有，或者我们在 Service 里加参数
    // 为了严谨，我们应该修改 Service 的 findAll 方法
    return this.recordsService.findAllByUser(req.user.userId);
  }

  @Patch(':id/favorite')
  toggleFavorite(@Param('id') id: string) {
    // 实际应该检查这个 record 是否属于当前用户
    return this.recordsService.toggleFavorite(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recordsService.remove(id);
  }
  
  @Delete()
  clearAll(@Request() req) {
      return this.recordsService.clearAllByUser(req.user.userId);
  }
}
