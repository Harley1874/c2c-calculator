import { Controller, Get, Query, Logger } from '@nestjs/common';
import { C2CService } from './c2c.service';

@Controller('c2c')
export class C2CController {
  private readonly logger = new Logger(C2CController.name);

  constructor(private readonly c2cService: C2CService) {}

  @Get('price')
  async getPrice(
    @Query('asset') asset: string = 'USDT',
    @Query('fiat') fiat: string = 'CNY',
    @Query('tradeType') tradeType: string = 'SELL',
  ) {
    this.logger.log(`Received getPrice request for ${asset}/${fiat} ${tradeType}`);
    return this.c2cService.getPrice(asset, fiat, tradeType);
  }

  @Get('force-refresh')
  async forceRefresh(
    @Query('asset') asset: string = 'USDT',
    @Query('fiat') fiat: string = 'CNY',
    @Query('tradeType') tradeType: string = 'SELL',
  ) {
    this.logger.log(`Received force-refresh request for ${asset}/${fiat} ${tradeType}`);
    return this.c2cService.forceRefresh(asset, fiat, tradeType);
  }
}

