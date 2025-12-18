import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // ✅ Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Erreur si propriétés inconnues
      transform: true, // Transforme automatiquement les types (string -> number, etc.)
    }),
  );

  // 🌐 CORS pour le frontend
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:5173',
    credentials: true,
  });

  // 🚀 Démarrage du serveur
  const port = configService.get<number>('PORT') || 3002;
  await app.listen(port);

  console.log(`🏦 Financial Service running on http://localhost:${port}`);
}

bootstrap();
