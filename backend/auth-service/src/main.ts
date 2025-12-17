import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🎯 Validation automatique des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Retire les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Erreur si propriété inconnue
      transform: true, // Transforme les types automatiquement
    }),
  );

  // 🌐 CORS (pour que le frontend puisse appeler l'API)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Auth Service lancé sur http://localhost:${port}`);
}

bootstrap();
