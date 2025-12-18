import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  accountId: number;
}

export class SendMessageDto {
  @IsInt()
  @Min(1)
  roomId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GetMessagesDto {
  @IsInt()
  @Min(1)
  roomId: number;
}
