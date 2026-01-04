import { Module } from '@nestjs/common';
import { C2CController } from './c2c.controller';
import { C2CService } from './c2c.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [C2CController],
  providers: [C2CService],
})
export class C2CModule {}

