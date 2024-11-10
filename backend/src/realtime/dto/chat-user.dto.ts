// src/realtime/dto/chat-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class ChatUserDto {
  @ApiProperty({
    description: 'Unique identifier of the user.',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the user.',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'URL of the user\'s avatar image.',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar?: string | null;
}
