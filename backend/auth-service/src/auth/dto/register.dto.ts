import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'Email requis' })
  email!: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne' })
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @IsNotEmpty({ message: 'Mot de passe requis' })
  password!: string;

  @IsString({ message: 'Le nom doit être une chaîne' })
  @IsNotEmpty({ message: 'Nom requis' })
  name!: string;
}
