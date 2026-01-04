import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RecordsModule } from './records/records.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { C2CModule } from './c2c/c2c.module';

@Module({
  imports: [PrismaModule, RecordsModule, AuthModule, UsersModule, C2CModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

