// src/users/dto/users.dto.ts

import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';

/**
 * Data Transfer Object for creating a new user.
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'User email address. Must be a valid email.',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password must be at least 8 characters long and contain uppercase, lowercase, number/special character.',
    example: 'Password123!',
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, number/special character',
  })
  password: string;

  @ApiProperty({
    description: 'Full name of the user.',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Phone number of the user.',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber() // Removed 'null' to fix TS2345 error
  phone?: string;

  @ApiProperty({
    description: 'Role of the user.',
    enum: Role,
    example: Role.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

/**
 * Data Transfer Object for updating an existing user.
 */
export class UpdateUserDto {
  @ApiProperty({
    description: 'Full name of the user.',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Email address of the user. Must be a valid email.',
    example: 'newemail@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number of the user.',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber() // Removed 'null' to fix TS2345 error
  phone?: string;

  @ApiProperty({
    description:
      'Password must be at least 8 characters long and contain uppercase, lowercase, number/special character.',
    example: 'NewPassword123!',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, number/special character',
  })
  password?: string;

  @ApiProperty({
    description: 'Role of the user.',
    enum: Role,
    example: Role.ADMIN,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'Status of the user.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

/**
 * Data Transfer Object for returning user data to clients.
 * Excludes sensitive fields like password.
 */
export class UserDto {
  @ApiProperty({
    description: 'Unique identifier of the user.',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name of the user.',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Phone number of the user.',
    example: '+1234567890',
    required: false,
    nullable: true,
  })
  phone?: string | null;

  @ApiProperty({
    description: 'Role of the user.',
    enum: Role,
    example: Role.USER,
  })
  role: Role;

  @ApiProperty({
    description: 'Status of the user.',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Timestamp when the user was created.',
    example: new Date(),
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp of the last login.',
    example: new Date(),
    required: false,
    nullable: true,
  })
  lastLogin?: Date | null;

  @ApiProperty({
    description: 'Online status of the user.',
    example: true,
  })
  isOnline: boolean;

  @ApiProperty({
    description: 'Counts of related orders and notifications.',
    type: Object,
  })
  _count: {
    orders: number;
    notifications: number;
  };
}
