import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // 🔧 Configuration (.env)
    ConfigModule.forRoot({
      isGlobal: true, // Accessible partout
    }),
    
    // 📦 Modules métier
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
