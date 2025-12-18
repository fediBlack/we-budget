import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../node_modules/.prisma/client-events';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma (Events) connecté à PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
