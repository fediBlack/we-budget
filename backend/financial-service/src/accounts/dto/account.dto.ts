import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { AccountType, Currency } from '@prisma/client';

// 📝 DTO pour créer un compte
export class CreateAccountDto {
  @IsString()
  name: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency = Currency.EUR;

  @IsNumber()
  @IsOptional()
  @Min(0)
  balance?: number = 0;
}

// 📝 DTO pour mettre à jour un compte
export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;
}

// 📝 DTO pour ajouter un membre
export class AddMemberDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsOptional()
  role?: string = 'MEMBER';
}
