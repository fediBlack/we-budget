import { IsEnum, IsString, IsOptional, IsObject } from 'class-validator';
import { EventType, EventStatus } from '../../../node_modules/.prisma/client-events';

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
