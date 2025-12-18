import { IsNumber, IsEnum, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { TransactionType, TransactionCategory } from '@webudget/shared-types';

// 📝 DTO pour créer une transaction
export class CreateTransactionDto {
  @IsNumber()
  accountId: number;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string; // Format ISO 8601
}

// 📝 DTO pour mettre à jour une transaction
export class UpdateTransactionDto {
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  amount?: number;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsEnum(TransactionCategory)
  @IsOptional()
  category?: TransactionCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
