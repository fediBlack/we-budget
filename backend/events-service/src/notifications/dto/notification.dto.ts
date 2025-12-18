import { IsEnum, IsString, IsOptional, IsInt } from 'class-validator';
import { NotificationChannel } from '@prisma/client';

export class CreateNotificationDto {
  @IsInt()
  @IsOptional()
  eventId?: number;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  title: string;

  @IsString()
  body: string;
}

export class UpdatePreferencesDto {
  @IsOptional()
  enableInApp?: boolean;

  @IsOptional()
  enableEmail?: boolean;

  @IsOptional()
  enablePush?: boolean;

  @IsOptional()
  budgetLimit?: boolean;

  @IsOptional()
  recurringDue?: boolean;

  @IsOptional()
  lowBalance?: boolean;

  @IsOptional()
  largeTransaction?: boolean;

  @IsOptional()
  accountShared?: boolean;

  @IsOptional()
  reminder?: boolean;
}
