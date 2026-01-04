import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { Prisma } from '@prisma/client';

@Injectable()
export class C2CService {
  private readonly logger = new Logger(C2CService.name);

  constructor(private prisma: PrismaService) {}

  async getPrice(asset: string, fiat: string, tradeType: string) {
    // 1. Check cache (database)
    const validTime = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes
    
    const cachedPrice = await this.prisma.c2CPrice.findFirst({
      where: {
        asset,
        fiat,
        tradeType,
        createdAt: {
          gte: validTime,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (cachedPrice) {
      this.logger.log(`Using cached price for ${asset}/${fiat} ${tradeType}: ${cachedPrice.price}`);
      return { 
        price: Number(cachedPrice.price),
        updatedAt: cachedPrice.createdAt
      };
    }

    // 2. Fetch from Binance
    this.logger.log(`Fetching fresh price for ${asset}/${fiat} ${tradeType}`);
    try {
      const bestPrice = await this.fetchFromBinance(asset, fiat, tradeType);
      
      // 3. Save to database
      const savedPrice = await this.prisma.c2CPrice.create({
        data: {
          asset,
          fiat,
          tradeType,
          price: new Prisma.Decimal(bestPrice),
        },
      });

      return { 
        price: bestPrice,
        updatedAt: savedPrice.createdAt
      };
    } catch (error) {
      this.logger.error('Failed to fetch price from Binance', error);
      // Fallback to latest available price even if expired?
      // For now, re-throw or return 0
      const latest = await this.prisma.c2CPrice.findFirst({
         where: { asset, fiat, tradeType },
         orderBy: { createdAt: 'desc' }
      });
      
      if (latest) {
          this.logger.warn('Returning expired price due to fetch error');
          return { 
            price: Number(latest.price),
            updatedAt: latest.createdAt
          };
      }
      
      throw error;
    }
  }

  async forceRefresh(asset: string, fiat: string, tradeType: string) {
    this.logger.log(`Force refreshing price for ${asset}/${fiat} ${tradeType}`);
    const bestPrice = await this.fetchFromBinance(asset, fiat, tradeType);
    
    const savedPrice = await this.prisma.c2CPrice.create({
      data: {
        asset,
        fiat,
        tradeType,
        price: new Prisma.Decimal(bestPrice),
      },
    });

    return { 
      price: bestPrice,
      updatedAt: savedPrice.createdAt
    };
  }

  private async fetchFromBinance(asset: string, fiat: string, tradeType: string): Promise<number> {
    const payload = {
      fiat,
      page: 1,
      rows: 10,
      tradeType,
      asset,
      countries: [],
      proMerchantAds: false,
      shieldMerchantAds: true,
      filterType: 'tradable',
      periods: [],
      additionalKycVerifyFilter: 0,
      publisherType: null,
      payTypes: [],
      classifies: ['mass', 'profession', 'fiat_trade'],
      tradedWith: false,
      followed: false,
    };

    const response = await axios.post(
      'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
      payload
    );

    const data = response.data;
    if (data.code !== '000000' || !data.data) {
      throw new Error(`Binance API error: ${JSON.stringify(data)}`);
    }

    // Calculate best price
    // If tradeType is SELL (we are selling), we look for ads where advertisers are BUYING.
    // In Binance API, tradeType 'SELL' means ads where the advertiser is buying from us? 
    // Wait, let's verify.
    // In the client code, it uses `tradeType: 'SELL'`.
    // And it finds `Math.max`.
    // So we are looking for the highest price.
    
    const ads = data.data as any[];
    if (ads.length === 0) return 0;

    const bestPrice = ads.reduce((max: number, item: any) => {
      const price = Number(item.adv.price);
      return Math.max(max, price);
    }, 0);

    return bestPrice;
  }
}

