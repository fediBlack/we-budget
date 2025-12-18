import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../node_modules/.prisma/client-auth';

// 🗄️ Service Prisma - Gère la connexion à la base de données
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // ✅ Se connecte à PostgreSQL au démarrage du module
    await this.$connect();
    console.log('✅ Prisma connecté à PostgreSQL');
  }

  async onModuleDestroy() {
    // 🔌 Se déconnecte proprement à l'arrêt
    await this.$disconnect();
    console.log('🔌 Prisma déconnecté');
  }
}
