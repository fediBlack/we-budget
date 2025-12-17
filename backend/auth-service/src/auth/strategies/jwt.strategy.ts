import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// 🔐 Stratégie JWT - Valide le token et extrait les infos utilisateur
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Cherche dans "Authorization: Bearer <token>"
      ignoreExpiration: false, // Rejette si expiré
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  // 🎯 Payload du token est validé ici
  // Retourne l'objet qui sera attaché à req.user
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
