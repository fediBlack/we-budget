import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { EventType, EventStatus } from '@prisma/client';

export class CreateEventDto {
  @IsEnum(EventType)
  type: EventType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateEventDto {
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}
