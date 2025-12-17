import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 🔒 Guard JWT - Protège les routes qui nécessitent une authentification
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
