import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 🌍 Module global Prisma - Accessible partout sans import
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
