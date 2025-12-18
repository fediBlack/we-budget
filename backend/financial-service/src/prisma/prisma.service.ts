import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// 🗄️ Service Prisma - Gère la connexion à la base de données
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // ✅ Se connecte à PostgreSQL au démarrage du module
    await (this as PrismaClient).$connect();
    console.log('✅ Prisma (Financial) connecté à PostgreSQL');
  }

  async onModuleDestroy() {
    // 🔌 Se déconnecte proprement à l'arrêt
    await (this as PrismaClient).$disconnect();
    console.log('🔌 Prisma (Financial) déconnecté');
  }
}
