import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 🔒 Guard JWT - Protège les routes avec le token
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
