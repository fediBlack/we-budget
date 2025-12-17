import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from '@webudget/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 📝 INSCRIPTION
  async register(dto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email déjà utilisé');
    }

    // Hash du mot de passe (bcrypt avec 10 rounds)
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Stocker le refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Retourner user (sans password) + tokens
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  // 🔑 CONNEXION
  async login(dto: LoginDto) {
    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Stocker le refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Retourner user (sans password) + tokens
    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  // 🔄 REFRESH TOKEN
  async refreshTokens(refreshToken: string) {
    // Vérifier que le refresh token existe en base
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    // Vérifier l'expiration
    if (storedToken.expiresAt < new Date()) {
      // Supprimer le token expiré
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expiré');
    }

    // Générer de nouveaux tokens
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
    );

    // Supprimer l'ancien refresh token et stocker le nouveau
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    await this.storeRefreshToken(storedToken.user.id, tokens.refreshToken);

    return tokens;
  }

  // 🚪 DÉCONNEXION
  async logout(userId: number) {
    // Supprimer tous les refresh tokens de l'utilisateur
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Déconnexion réussie' };
  }

  // 🔧 HELPERS

  private async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    // Access Token (courte durée : 15min)
    const accessToken = this.jwtService.sign(payload);

    // Refresh Token (longue durée : 7 jours) avec JTI unique
    const refreshToken = this.jwtService.sign(
      { 
        ...payload,
        jti: `${userId}-${Date.now()}-${Math.random()}` // ID unique
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      },
    );

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: number, token: string) {
    // Calculer la date d'expiration (7 jours)
    const expiresAt = new Date();
    const expirationDays = 7;
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    // Stocker en base
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  // Obtenir l'utilisateur connecté (pour les routes protégées)
  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
